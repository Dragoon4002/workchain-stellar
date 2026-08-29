#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token::Client as TokenClient, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct Participant {
    pub wallet: Address,
    pub bps: u32, // basis points; 10000 = 100%
}

#[contracttype]
#[derive(Clone)]
pub struct VaultMilestone {
    pub description: String,
    pub amount: i128,
    pub state: u32, // 0=pending 1=submitted 2=approved 3=disputed 4=claimable(timeout)
    pub submitted_at: u64,
    pub proof_url: Option<String>,
}

#[contracttype]
#[derive(Clone)]
pub struct VaultData {
    pub owner: Address,
    pub token: Address,
    pub total: i128,
    pub deposited: i128,
    pub state: u32, // 0=funding 1=active 2=settled 3=cancelled
    pub participant_count: u32,
    pub milestone_count: u32,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Vault(u32),
    Participant(u32, u32), // (vault_id, participant_idx)
    Milestone(u32, u32),   // (vault_id, milestone_idx)
}

const TIMEOUT_SECS: u64 = 259_200; // 72 hours

#[contract]
pub struct ProjectVaultContract;

#[contractimpl]
impl ProjectVaultContract {
    /// Create a project vault. participants bps must sum to 10000; max 10 participants.
    pub fn create(
        env: Env,
        owner: Address,
        token: Address,
        total: i128,
        participants: soroban_sdk::Vec<Participant>,
    ) -> u32 {
        owner.require_auth();

        let n = participants.len();
        assert!(n > 0, "no participants");
        assert!(n <= 10, "max 10 participants");
        assert!(total > 0, "total must be positive");

        let mut bps_sum: u32 = 0;
        for p in participants.iter() {
            bps_sum += p.bps;
        }
        assert!(bps_sum == 10_000, "bps must sum to 10000");

        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0u32)
            + 1;
        env.storage().persistent().set(&DataKey::Counter, &id);

        let vault = VaultData {
            owner: owner.clone(),
            token,
            total,
            deposited: 0,
            state: 0,
            participant_count: n,
            milestone_count: 0,
        };
        env.storage().persistent().set(&DataKey::Vault(id), &vault);

        // store participants individually to avoid Vec<Participant> in storage
        for (i, p) in participants.iter().enumerate() {
            env.storage()
                .persistent()
                .set(&DataKey::Participant(id, i as u32), &p);
        }

        env.events().publish(
            (Symbol::new(&env, "vault"), Symbol::new(&env, "created")),
            (id, owner, total),
        );

        id
    }

    /// Fund the vault. Anyone can fund. Activates (state→1) when deposited >= total.
    pub fn fund(env: Env, funder: Address, vault_id: u32, amount: i128) {
        funder.require_auth();

        let mut vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.state == 0, "vault not in funding state");
        assert!(amount > 0, "amount must be positive");

        TokenClient::new(&env, &vault.token).transfer(
            &funder,
            &env.current_contract_address(),
            &amount,
        );

        vault.deposited += amount;
        if vault.deposited >= vault.total {
            vault.state = 1;
            env.events().publish(
                (Symbol::new(&env, "vault"), Symbol::new(&env, "activated")),
                (vault_id,),
            );
        }
        env.storage().persistent().set(&DataKey::Vault(vault_id), &vault);

        env.events().publish(
            (Symbol::new(&env, "vault"), Symbol::new(&env, "funded")),
            (vault_id, funder, amount),
        );
    }

    /// Add a milestone. Only owner, only while state <= 1 (funding or active).
    pub fn add_milestone(
        env: Env,
        owner: Address,
        vault_id: u32,
        description: String,
        amount: i128,
    ) -> u32 {
        owner.require_auth();

        let mut vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.owner == owner, "not owner");
        assert!(vault.state <= 1, "vault not open");
        assert!(amount > 0, "amount must be positive");

        let idx = vault.milestone_count;
        vault.milestone_count += 1;
        env.storage().persistent().set(&DataKey::Vault(vault_id), &vault);

        let m = VaultMilestone {
            description,
            amount,
            state: 0,
            submitted_at: 0,
            proof_url: None,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(vault_id, idx), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "added")),
            (vault_id, idx, amount),
        );

        idx
    }

    /// Participant submits work for a milestone.
    pub fn submit_milestone(
        env: Env,
        caller: Address,
        vault_id: u32,
        milestone_idx: u32,
        proof_url: String,
    ) {
        caller.require_auth();

        let vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.state == 1, "vault not active");

        let mut m: VaultMilestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(vault_id, milestone_idx))
            .expect("milestone not found");

        assert!(m.state == 0 || m.state == 3, "not pending or disputed");

        assert!(
            caller == vault.owner || is_participant(&env, vault_id, vault.participant_count, &caller),
            "not a participant"
        );

        m.state = 1;
        m.submitted_at = env.ledger().timestamp();
        m.proof_url = Some(proof_url);
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(vault_id, milestone_idx), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "submitted")),
            (vault_id, milestone_idx, caller),
        );
    }

    /// Owner approves submitted milestone → distributes funds to participants.
    pub fn approve_milestone(env: Env, owner: Address, vault_id: u32, milestone_idx: u32) {
        owner.require_auth();

        let vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.owner == owner, "not owner");
        assert!(vault.state == 1, "vault not active");

        let mut m: VaultMilestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(vault_id, milestone_idx))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");

        m.state = 2;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(vault_id, milestone_idx), &m);

        settle_milestone(&env, vault_id, &vault, m.amount);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "approved")),
            (vault_id, milestone_idx, m.amount),
        );
    }

    /// Claim auto-release after 72h of no client response.
    pub fn claim_timeout(env: Env, caller: Address, vault_id: u32, milestone_idx: u32) {
        caller.require_auth();

        let vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.state == 1, "vault not active");

        let mut m: VaultMilestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(vault_id, milestone_idx))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");
        assert!(
            env.ledger().timestamp() > m.submitted_at + TIMEOUT_SECS,
            "timeout not elapsed"
        );

        assert!(
            caller == vault.owner || is_participant(&env, vault_id, vault.participant_count, &caller),
            "not a participant"
        );

        m.state = 4;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(vault_id, milestone_idx), &m);

        settle_milestone(&env, vault_id, &vault, m.amount);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "timeout_claimed")),
            (vault_id, milestone_idx),
        );
    }

    /// Raise a dispute on a submitted milestone.
    pub fn dispute_milestone(env: Env, caller: Address, vault_id: u32, milestone_idx: u32) {
        caller.require_auth();

        let vault: VaultData = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        assert!(vault.state == 1, "vault not active");

        let mut m: VaultMilestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(vault_id, milestone_idx))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");
        assert!(
            caller == vault.owner || is_participant(&env, vault_id, vault.participant_count, &caller),
            "not a participant"
        );

        m.state = 3;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(vault_id, milestone_idx), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "disputed")),
            (vault_id, milestone_idx, caller),
        );
    }

    pub fn get_vault(env: Env, vault_id: u32) -> VaultData {
        env.storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found")
    }

    pub fn get_milestone(env: Env, vault_id: u32, milestone_idx: u32) -> VaultMilestone {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(vault_id, milestone_idx))
            .expect("milestone not found")
    }

    pub fn get_participant(env: Env, vault_id: u32, participant_idx: u32) -> Participant {
        env.storage()
            .persistent()
            .get(&DataKey::Participant(vault_id, participant_idx))
            .expect("participant not found")
    }
}

fn is_participant(env: &Env, vault_id: u32, count: u32, addr: &Address) -> bool {
    for i in 0..count {
        let p: Participant = env
            .storage()
            .persistent()
            .get(&DataKey::Participant(vault_id, i))
            .expect("participant not found");
        if p.wallet == *addr {
            return true;
        }
    }
    false
}

fn settle_milestone(env: &Env, vault_id: u32, vault: &VaultData, amount: i128) {
    let token = TokenClient::new(env, &vault.token);
    let contract_addr = env.current_contract_address();

    for i in 0..vault.participant_count {
        let p: Participant = env
            .storage()
            .persistent()
            .get(&DataKey::Participant(vault_id, i))
            .expect("participant not found");
        let share = amount * p.bps as i128 / 10_000;
        if share > 0 {
            token.transfer(&contract_addr, &p.wallet, &share);
        }
    }
}

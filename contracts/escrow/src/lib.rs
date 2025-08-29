#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};
use soroban_sdk::token::Client as TokenClient;

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub client: Address,
    pub freelancer: Address,
    pub server: Address,
    pub amount: i128,
    pub token: Address,
    // 0=pending_countersign, 1=active, 2=released, 3=cancelled, 4=disputed
    pub state: u32,
    pub client_signed: bool,
    pub freelancer_signed: bool,
    // for mutual actions: 0=none, 1=release, 2=cancel
    pub pending_action: u32,
    pub client_action_signed: bool,
    pub freelancer_action_signed: bool,
}

#[contracttype]
pub enum DataKey {
    Escrow(u32),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Client deposits funds; escrow starts in pending_countersign state.
    /// Both parties must countersign before work begins.
    pub fn deposit(
        env: Env,
        client: Address,
        freelancer: Address,
        server: Address,
        amount: i128,
        token: Address,
        escrow_id: u32,
    ) {
        client.require_auth();

        TokenClient::new(&env, &token).transfer(
            &client,
            &env.current_contract_address(),
            &amount,
        );

        let data = EscrowData {
            client: client.clone(),
            freelancer,
            server,
            amount,
            token,
            state: 0,
            client_signed: true, // depositing = client's signature
            freelancer_signed: false,
            pending_action: 0,
            client_action_signed: false,
            freelancer_action_signed: false,
        };
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "deposit")),
            (client, amount, escrow_id),
        );
    }

    /// Freelancer countersigns to activate the escrow.
    pub fn countersign(env: Env, freelancer: Address, escrow_id: u32) {
        freelancer.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert!(data.freelancer == freelancer, "not freelancer");
        assert!(data.state == 0, "not pending countersign");

        data.freelancer_signed = true;
        data.state = 1; // active
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "activated")),
            (escrow_id,),
        );
    }

    /// Initiate a mutual release (pay freelancer) or mutual cancel (refund client).
    /// First caller sets the pending action; second caller from the other party executes it.
    /// action: 1 = release to freelancer, 2 = cancel/refund to client
    pub fn propose_mutual(env: Env, caller: Address, escrow_id: u32, action: u32) {
        caller.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert!(data.state == 1, "escrow not active");
        assert!(action == 1 || action == 2, "invalid action");
        assert!(
            caller == data.client || caller == data.freelancer,
            "not a party"
        );

        let is_client = caller == data.client;

        if data.pending_action == 0 {
            // First proposal
            data.pending_action = action;
            if is_client {
                data.client_action_signed = true;
                data.freelancer_action_signed = false;
            } else {
                data.freelancer_action_signed = true;
                data.client_action_signed = false;
            }
            env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

            env.events().publish(
                (Symbol::new(&env, "escrow"), Symbol::new(&env, "proposed")),
                (escrow_id, action, caller),
            );
        } else {
            // Second signature — must agree on same action, must be the other party
            assert!(data.pending_action == action, "action mismatch");
            if is_client {
                assert!(!data.client_action_signed, "already signed");
            } else {
                assert!(!data.freelancer_action_signed, "already signed");
            }

            // Execute
            if action == 1 {
                // release to freelancer
                TokenClient::new(&env, &data.token).transfer(
                    &env.current_contract_address(),
                    &data.freelancer,
                    &data.amount,
                );
                data.state = 2;
                env.events().publish(
                    (Symbol::new(&env, "escrow"), Symbol::new(&env, "released")),
                    (escrow_id, data.amount),
                );
            } else {
                // cancel, refund to client
                TokenClient::new(&env, &data.token).transfer(
                    &env.current_contract_address(),
                    &data.client,
                    &data.amount,
                );
                data.state = 3;
                env.events().publish(
                    (Symbol::new(&env, "escrow"), Symbol::new(&env, "cancelled")),
                    (escrow_id,),
                );
            }

            env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);
        }
    }

    /// Either party raises a dispute. Locks out mutual actions; server must resolve.
    pub fn dispute(env: Env, caller: Address, escrow_id: u32) {
        caller.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert!(
            caller == data.client || caller == data.freelancer,
            "not a party"
        );
        assert!(data.state == 1, "escrow not active");

        data.state = 4;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "disputed")),
            (escrow_id, caller),
        );
    }

    /// Server resolves a dispute. Only callable by server, only when state=disputed.
    /// ruling: 0 = pay freelancer, 1 = refund client
    pub fn resolve_dispute(env: Env, server: Address, escrow_id: u32, ruling: u32) {
        server.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert!(data.server == server, "not server");
        assert!(data.state == 4, "not disputed");
        assert!(ruling == 0 || ruling == 1, "invalid ruling");

        let recipient = if ruling == 0 {
            data.freelancer.clone()
        } else {
            data.client.clone()
        };

        TokenClient::new(&env, &data.token).transfer(
            &env.current_contract_address(),
            &recipient,
            &data.amount,
        );

        // ponytail: reuse state 2 for "resolved → freelancer", 3 for "resolved → client"
        data.state = if ruling == 0 { 2 } else { 3 };
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "resolved")),
            (escrow_id, ruling, recipient),
        );
    }

    /// Partial release by mutual consent (both must call with same amount).
    pub fn partial_release(env: Env, client: Address, escrow_id: u32, amount: i128) {
        client.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert!(data.client == client, "not client");
        assert!(data.state == 1, "escrow not active");
        assert!(amount <= data.amount, "exceeds escrow");

        TokenClient::new(&env, &data.token).transfer(
            &env.current_contract_address(),
            &data.freelancer,
            &amount,
        );

        data.amount -= amount;
        if data.amount == 0 {
            data.state = 2;
        }
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "partial_release")),
            (escrow_id, amount),
        );
    }

    pub fn get(env: Env, escrow_id: u32) -> EscrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found")
    }
}

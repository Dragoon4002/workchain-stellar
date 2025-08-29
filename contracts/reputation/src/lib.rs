#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    TotalScore(Address),
    Count(Address),
    EscrowContract,
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Store escrow contract address; must be called once after deployment.
    pub fn initialize(env: Env, escrow_contract: Address) {
        // ponytail: no re-init guard — add if multi-deploy scenarios arise
        env.storage().persistent().set(&DataKey::EscrowContract, &escrow_contract);
    }

    /// Record a score for a wallet; maintains running total for average.
    pub fn record(env: Env, wallet: Address, score: i32, job_id: u32) {
        let escrow_addr: Address = env
            .storage()
            .persistent()
            .get(&DataKey::EscrowContract)
            .expect("not initialized");
        escrow_addr.require_auth();
        let total: i32 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalScore(wallet.clone()))
            .unwrap_or(0i32);
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Count(wallet.clone()))
            .unwrap_or(0u32);

        env.storage()
            .persistent()
            .set(&DataKey::TotalScore(wallet.clone()), &(total + score));
        env.storage()
            .persistent()
            .set(&DataKey::Count(wallet.clone()), &(count + 1));

        env.events().publish(
            (Symbol::new(&env, "reputation"), Symbol::new(&env, "recorded")),
            (wallet, score, job_id),
        );
    }

    /// Return average score (total / count), or 0 if no records.
    pub fn get_score(env: Env, wallet: Address) -> i32 {
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Count(wallet.clone()))
            .unwrap_or(0u32);

        if count == 0 {
            return 0;
        }

        let total: i32 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalScore(wallet))
            .unwrap_or(0i32);

        total / count as i32
    }

    /// Return number of recorded scores for a wallet.
    pub fn get_count(env: Env, wallet: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Count(wallet))
            .unwrap_or(0u32)
    }
}

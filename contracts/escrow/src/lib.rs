#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};
use soroban_sdk::token::Client as TokenClient;

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub token: Address,
    pub state: u32, // 0=active, 1=released, 2=cancelled, 3=disputed
}

#[contracttype]
pub enum DataKey {
    Escrow(u32),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Deposit funds into escrow for a milestone.
    pub fn deposit(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        token: Address,
        milestone_id: u32,
    ) {
        client.require_auth();

        TokenClient::new(&env, &token).transfer(&client, &env.current_contract_address(), &amount);

        let data = EscrowData {
            client: client.clone(),
            freelancer,
            amount,
            token,
            state: 0,
        };
        env.storage().persistent().set(&DataKey::Escrow(milestone_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "deposit")),
            (client, amount, milestone_id),
        );
    }

    /// Release full escrow amount to freelancer.
    pub fn release(env: Env, client: Address, milestone_id: u32) {
        client.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(milestone_id))
            .expect("escrow not found");

        assert!(data.client == client, "not client");
        assert!(data.state == 0, "not active");

        TokenClient::new(&env, &data.token).transfer(
            &env.current_contract_address(),
            &data.freelancer,
            &data.amount,
        );

        data.state = 1;
        env.storage().persistent().set(&DataKey::Escrow(milestone_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "release")),
            (milestone_id, data.amount),
        );
    }

    /// Release a partial amount to freelancer; remainder stays in escrow.
    pub fn partial_release(env: Env, client: Address, milestone_id: u32, amount: i128) {
        client.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(milestone_id))
            .expect("escrow not found");

        assert!(data.client == client, "not client");
        assert!(data.state == 0, "not active");
        assert!(amount <= data.amount, "amount exceeds escrow");

        TokenClient::new(&env, &data.token).transfer(
            &env.current_contract_address(),
            &data.freelancer,
            &amount,
        );

        data.amount -= amount;
        // ponytail: keep state active if remainder > 0, mark released if fully drained
        if data.amount == 0 {
            data.state = 1;
        }
        env.storage().persistent().set(&DataKey::Escrow(milestone_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "partial_release")),
            (milestone_id, amount),
        );
    }

    /// Cancel escrow and refund client.
    pub fn cancel(env: Env, client: Address, milestone_id: u32) {
        client.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(milestone_id))
            .expect("escrow not found");

        assert!(data.client == client, "not client");
        assert!(data.state == 0, "not active");

        TokenClient::new(&env, &data.token).transfer(
            &env.current_contract_address(),
            &data.client,
            &data.amount,
        );

        data.state = 2;
        env.storage().persistent().set(&DataKey::Escrow(milestone_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "cancel")),
            (milestone_id,),
        );
    }

    /// Raise a dispute; either party may call.
    pub fn dispute(env: Env, caller: Address, milestone_id: u32) {
        caller.require_auth();

        let mut data: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(milestone_id))
            .expect("escrow not found");

        assert!(
            caller == data.client || caller == data.freelancer,
            "not party"
        );
        assert!(data.state == 0, "not active");

        data.state = 3;
        env.storage().persistent().set(&DataKey::Escrow(milestone_id), &data);

        env.events().publish(
            (Symbol::new(&env, "escrow"), Symbol::new(&env, "dispute")),
            (milestone_id, caller),
        );
    }

    /// Read escrow state.
    pub fn get(env: Env, milestone_id: u32) -> EscrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(milestone_id))
            .expect("escrow not found")
    }
}

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct MilestoneData {
    pub job_id: u32,
    pub description: String,
    pub amount: i128,
    pub deadline: u64,
    pub state: u32, // 0=pending, 1=submitted, 2=approved, 3=revision_requested, 4=disputed
    pub proof_url: Option<String>,
    pub feedback: Option<String>,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Milestone(u32),
}

#[contract]
pub struct MilestoneContract;

#[contractimpl]
impl MilestoneContract {
    /// Create a milestone; returns milestone_id.
    pub fn create(
        env: Env,
        job_id: u32,
        description: String,
        amount: i128,
        deadline: u64,
    ) -> u32 {
        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0u32)
            + 1;

        env.storage().persistent().set(&DataKey::Counter, &id);

        let m = MilestoneData {
            job_id,
            description,
            amount,
            deadline,
            state: 0,
            proof_url: None,
            feedback: None,
        };
        env.storage().persistent().set(&DataKey::Milestone(id), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "created")),
            (id, job_id, amount),
        );

        id
    }

    /// Freelancer submits work with a proof URL. Also allows resubmission when revision_requested.
    pub fn submit(env: Env, freelancer: Address, milestone_id: u32, proof_url: String) {
        freelancer.require_auth();

        let mut m: MilestoneData = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found");

        assert!(m.state == 0 || m.state == 3, "not pending or revision_requested");

        m.state = 1;
        m.proof_url = Some(proof_url);
        m.feedback = None; // clear feedback on resubmission
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(milestone_id), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "submitted")),
            (milestone_id, freelancer),
        );
    }

    /// Client approves submitted work.
    pub fn approve(env: Env, client: Address, milestone_id: u32) {
        client.require_auth();

        let mut m: MilestoneData = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");

        m.state = 2;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(milestone_id), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "approved")),
            (milestone_id, m.amount),
        );
    }

    /// Client requests revision on submitted work with feedback.
    pub fn request_revision(env: Env, client: Address, milestone_id: u32, feedback: String) {
        client.require_auth();

        let mut m: MilestoneData = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");

        m.state = 3;
        m.feedback = Some(feedback);
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(milestone_id), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "revision_requested")),
            (milestone_id, client),
        );
    }

    /// Either party raises a dispute. Only callable when submitted.
    pub fn dispute(env: Env, caller: Address, milestone_id: u32) {
        caller.require_auth();

        let mut m: MilestoneData = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found");

        assert!(m.state == 1, "not submitted");

        m.state = 4;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(milestone_id), &m);

        env.events().publish(
            (Symbol::new(&env, "milestone"), Symbol::new(&env, "disputed")),
            (milestone_id, caller),
        );
    }

    /// Read milestone data.
    pub fn get(env: Env, milestone_id: u32) -> MilestoneData {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found")
    }

    /// Get revision feedback for a milestone.
    pub fn get_feedback(env: Env, milestone_id: u32) -> String {
        let m: MilestoneData = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("milestone not found");
        m.feedback.expect("no feedback set")
    }
}

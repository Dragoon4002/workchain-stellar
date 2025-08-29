#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct JobData {
    pub client: Address,
    pub title: String,
    pub description: String,
    pub budget: i128,
    pub deadline: u64,
    pub state: u32, // 0=open, 1=active, 2=closed
    pub freelancer: Option<Address>,
}

#[contracttype]
#[derive(Clone)]
pub struct ProposalData {
    pub freelancer: Address,
    pub proposal: String,
    pub price: i128,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Job(u32),
    Proposal(u32, Address),
}

#[contract]
pub struct JobContract;

#[contractimpl]
impl JobContract {
    /// Post a new job; returns the new job_id.
    pub fn post_job(
        env: Env,
        client: Address,
        title: String,
        description: String,
        budget: i128,
        deadline: u64,
    ) -> u32 {
        client.require_auth();

        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0u32)
            + 1;

        env.storage().persistent().set(&DataKey::Counter, &id);

        let job = JobData {
            client: client.clone(),
            title,
            description,
            budget,
            deadline,
            state: 0,
            freelancer: None,
        };
        env.storage().persistent().set(&DataKey::Job(id), &job);

        env.events().publish(
            (Symbol::new(&env, "job"), Symbol::new(&env, "posted")),
            (id, client, budget),
        );

        id
    }

    /// Submit a bid for a job with a custom price (freelancer sets any price).
    pub fn bid(env: Env, freelancer: Address, job_id: u32, proposal: String, price: i128) {
        freelancer.require_auth();

        let job: JobData = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("job not found");
        assert!(job.state == 0, "job not open");
        assert!(price > 0, "price must be positive");

        let p = ProposalData {
            freelancer: freelancer.clone(),
            proposal,
            price,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(job_id, freelancer.clone()), &p);

        env.events().publish(
            (Symbol::new(&env, "job"), Symbol::new(&env, "bid")),
            (job_id, freelancer, price),
        );
    }

    /// Hire a freelancer; sets job to active.
    pub fn hire(env: Env, client: Address, job_id: u32, freelancer: Address) {
        client.require_auth();

        let mut job: JobData = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("job not found");

        assert!(job.client == client, "not client");
        assert!(job.state == 0, "job not open");

        job.freelancer = Some(freelancer.clone());
        job.state = 1;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (Symbol::new(&env, "job"), Symbol::new(&env, "hired")),
            (job_id, freelancer),
        );
    }

    /// Close a job.
    pub fn close(env: Env, client: Address, job_id: u32) {
        client.require_auth();

        let mut job: JobData = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("job not found");

        assert!(job.client == client, "not client");
        assert!(job.state != 2, "already closed");

        job.state = 2;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (Symbol::new(&env, "job"), Symbol::new(&env, "closed")),
            (job_id,),
        );
    }

    /// Read job data.
    pub fn get(env: Env, job_id: u32) -> JobData {
        env.storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("job not found")
    }
}

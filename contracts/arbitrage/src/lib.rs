use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::U128;
use near_sdk::{
    env, near_bindgen, AccountId, Balance, BorshStorageKey, PanicOnDefault, PromiseResult, serde_json, assert_one_yocto, Promise
};
use crate::utils::{ext_dex, ext_self, ext_ft, XCC_GAS, GAS_FOR_FT_TRANSFER, GAS_FOR_WITHDRAW};
mod token_receiver;
mod utils;

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Dexs
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Action {
    pub pool_id: u64,
    pub token_in: AccountId,
    pub amount_in: Option<U128>,
    pub token_out: AccountId,
    pub min_amount_out: U128,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner: AccountId,
    pub dexs: UnorderedSet<AccountId>
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            owner: env::predecessor_account_id(),
            dexs: UnorderedSet::new(StorageKey::Dexs),
        }
    }

    #[payable]
    pub fn add_dexs(&mut self, dexs: Vec<AccountId>) {
        assert_one_yocto();
        assert!(self.is_owner(), "Not owner");
        for dex in dexs {
            self.dexs.insert(&dex);
        }
    }

    #[payable]
    pub fn ft_deposit(&mut self, ft_account: AccountId) -> Promise {
        assert!(env::attached_deposit() >= 1250000000000000000000, "You need attach more yocto");
        ext_ft::ext(ft_account)
        .with_attached_deposit(1250000000000000000000)
        .with_static_gas(GAS_FOR_FT_TRANSFER)
        .storage_deposit(
            env::predecessor_account_id(),
            true,
        )
    }

    pub fn get_dexs(&self, from_index: u64, limit: u64) -> Vec<AccountId> {
        let dexs = self.dexs.as_vector();
        (from_index..std::cmp::min(from_index + limit, dexs.len()))
            .map(|index| dexs.get(index).unwrap())
            .collect()
    }

    #[private]
    pub fn callback_after_swap(
        &mut self,
        sender_id: AccountId,
        dex_id: AccountId,
        token_out: AccountId
    ) {
        assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(val) => {
                if let Ok(amount) = serde_json::from_slice::<U128>(&val) {
                    ext_dex::ext(dex_id)
                    .with_attached_deposit(1)
                    .with_static_gas(GAS_FOR_WITHDRAW)
                    .withdraw(token_out.clone(), amount, None);
                    ext_ft::ext(token_out)
                    .with_attached_deposit(1)
                    .with_static_gas(GAS_FOR_FT_TRANSFER)
                    .ft_transfer(sender_id, amount, None);
                } else {
                    env::panic_str("ERR_WRONG_VAL_RECEIVED")
                }
            }
            PromiseResult::Failed => env::panic_str("ERR_CALL_FAILED"),
        }
    }
}

impl Contract {
    pub fn is_owner(&self) -> bool {
        return self.owner == env::predecessor_account_id(); 
    }
}
pub(crate) fn xcc_actions(
        dex_id: AccountId,
        sender_id: AccountId,
        token_in: AccountId,
        amount_in: Balance,
        actions: Vec<Action>
    ) {
        let token_out: AccountId = actions[actions.len() -1].token_out.clone();
        ext_ft::ext(token_in)
        .with_attached_deposit(1)
        .with_static_gas(GAS_FOR_FT_TRANSFER)
        .ft_transfer_call(dex_id.clone(), U128(amount_in), None, String::from(""));
        ext_dex::ext(dex_id.clone())
            .with_static_gas(XCC_GAS)
            .with_attached_deposit(1)
            .swap(actions, None)
            .then(
                ext_self::ext(env::current_account_id())
                .callback_after_swap(sender_id.clone(), dex_id, token_out.clone())
            );
    }
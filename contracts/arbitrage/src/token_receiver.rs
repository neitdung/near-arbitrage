use crate::*;
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, serde_json, PromiseOrValue, AccountId};
use near_sdk::json_types::U128;

/// Message parameters to receive via token function call.
#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Execute {
        pub dex_id: AccountId,
        pub actions: Vec<Action>
}

#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    /// Callback on receiving tokens by this contract.
    /// `msg` format is either "" for deposit or `TokenReceiverMessage`.
    #[allow(unreachable_code)]
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let token_in = env::predecessor_account_id();
        if msg.is_empty() {
            PromiseOrValue::Value(amount)
        } else {
            let message =
                serde_json::from_str::<Execute>(&msg).expect("Wrong format!");
                xcc_actions(
                    message.dex_id,
                    sender_id,
                    token_in,
                    amount.0,
                    message.actions
                );
                PromiseOrValue::Value(U128(0))
            }

    }
}
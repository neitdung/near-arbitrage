use near_sdk::{ext_contract, Gas, AccountId, Promise};
use near_sdk::json_types::U128;
use near_contract_standards::storage_management::StorageBalance;
use crate::Action;
pub const GAS_FOR_FT_TRANSFER: Gas = Gas(5_000_000_000_000);
pub const GAS_FOR_WITHDRAW: Gas = Gas(50_000_000_000_000);
pub const XCC_GAS: Gas = Gas(10_000_000_000_000);

#[ext_contract(ext_ft)]
pub trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> U128;
    fn storage_deposit(account_id: AccountId, registration_only: bool) -> StorageBalance;
}

#[ext_contract(ext_dex)]
pub trait Dex {
    fn swap(&mut self, actions: Vec<Action>, referral_id: Option<AccountId>) -> U128;
    fn withdraw(
        &mut self,
        token_id: AccountId,
        amount: U128,
        unregister: Option<bool>,
    ) -> Promise;
}

#[ext_contract(ext_self)]
pub trait ContractActions {
    fn callback_after_swap(
        sender_id: AccountId,
        dex_id: AccountId,
        token_out: AccountId
    );
}
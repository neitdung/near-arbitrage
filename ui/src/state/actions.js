import BN from "bn.js";
import {
    parseNearAmount,
    factoryId,
} from "./near";
import { transactions } from "near-api-js";
import { loadRequiredDeposit } from "./views";

export const createNewFT = async (account, args) => {
    const amount = await loadRequiredDeposit(account, account.accountId, args);
    let actions = [
        transactions.functionCall(
            "create_token",
            Buffer.from(JSON.stringify({ args: args })),
            200000000000000,
            "0"
        ),
    ];
    if (amount) {
        actions.unshift(
            transactions.functionCall(
                "storage_deposit",
                {},
                10000000000000,
                new BN(amount).add(new BN("1000000"))
            )
        );
    }
    const result = await account.signAndSendTransaction({
        receiverId: factoryId,
        actions: actions,
    });
    return result;
};

export const faucetFT = async (account, seed_id) => {
    account
        .viewFunction(seed_id, "storage_balance_of", {
            account_id: account.accountId,
        }).then(res => {
            let actions = [
                transactions.functionCall(
                    "faucet",
                    {},
                    10000000000000,
                    "1"
                ),
            ];
            if (!res) {
                actions.unshift(
                    transactions.functionCall(
                        "storage_deposit",
                        { account_id: account.accountId },
                        10000000000000,
                        parseNearAmount('0.125')
                    )
                );
            }
            account.signAndSendTransaction({
                receiverId: seed_id,
                actions: actions,
            });
        })
};

export const depositFT = async (account, seed_id) => {
    await account.functionCall(
        seed_id,
        "storage_deposit",
        {},
        200000000000000,
        parseNearAmount("0.1250001")
    );
};

export const testSwap = async (account) => {
    let msg = JSON.stringify({
        dex_id: "dev-1656234694287-14038558864682",
        actions: [
            {   
                pool_id: 0,
                token_in: "dtt.dev-1656188046462-83531633920883",
                token_out: "dtt1.dev-1656188046462-83531633920883",
                amount_in: "1000",
                min_amount_out: "0",
            },
        ]
    });
    await account.functionCall(
        "dtt.dev-1656188046462-83531633920883",
        "ft_transfer_call",
        Buffer.from(JSON.stringify({
            receiver_id: "dev-1657391324310-71394568081833",
            amount: "1000",
            msg: msg
        })),
        300000000000000,
        1
    );
}

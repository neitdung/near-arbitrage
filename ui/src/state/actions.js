import BN from "bn.js";
import {
    parseNearAmount,
    factoryId,
    arbitrageId
} from "./near";
import { transactions } from "near-api-js";
import { loadRequiredDeposit } from "./views";

export const createNewFT = async (account, args) => {
    const amount = await loadRequiredDeposit(account, account.accountId, args);
    console.log(args)
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
                    { receiver_id: account.accountId },
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

export const swapAction = async (account, dex, actions, tokenIn, amountIn) => {
    let msg = JSON.stringify({
        dex_id: dex,
        actions: actions
    });
    let tokenOut = actions[actions.length - 1].token_out;
    account
        .viewFunction(tokenOut, "storage_balance_of", {
            account_id: account.accountId,
        }).then(async res => {
            if (!res) {
                await account.functionCall(
                    tokenOut,
                    "storage_deposit",
                    {},
                    200000000000000,
                    parseNearAmount("0.1250001")
                );
            } else {
                await account.functionCall(
                    tokenIn,
                    "ft_transfer_call",
                    Buffer.from(JSON.stringify({
                        receiver_id: arbitrageId,
                        amount: amountIn.toString(),
                        msg: msg
                    })),
                    300000000000000,
                    1
                );
            }
        })
}

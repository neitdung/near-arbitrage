import BN from "bn.js";
import {
  GAS,
  parseNearAmount,
  marketId,
  contractId,
  factoryId,
  farmingId,
} from "./near";
import { uploadToCrust } from "near-crust-ipfs";
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
        1000000000000,
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

export const depositFT = async (account, seed_id) => {
  await account.functionCall(
    seed_id,
    "storage_deposit",
    {},
    200000000000000,
    parseNearAmount("0.1250001")
  );
};

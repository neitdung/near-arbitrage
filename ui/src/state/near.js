import React from 'react';
import getConfig from '../config';
import * as nearAPI from 'near-api-js';
import { getWallet } from '../utils/near-utils';
import {Select, MenuItem, FormControl, TextField} from "@mui/material";

export const {
  GAS,
  explorerUrl,
  networkId,
  nodeUrl,
  walletUrl,
  nameSuffix,
  contractName: contractId,
} = getConfig();

export const marketId = "market." + contractId;
export const farmingId = "farming." + contractId;
export const factoryId = "factory." + contractId;

export const {
	utils: {
		format: {
			formatNearAmount, parseNearAmount
		}
	}
} = nearAPI;

export const initNear = () => async ({ update, getState, dispatch }) => {
	const { near, wallet, contractAccount } = await getWallet();

	wallet.signIn = () => {
		wallet.requestSignIn(contractId, 'Blah Blah');
	};
	const signOut = wallet.signOut;
	wallet.signOut = () => {
		signOut.call(wallet);
		update('wallet.signedIn', false);
		update('', { account: null });
		update('app.tab', 1);
	};

	wallet.signedIn = wallet.isSignedIn();

	let account;
	if (wallet.signedIn) {
		account = wallet.account();
		wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 4);
		await update('', { near, wallet, contractAccount, account });
	}

	await update('', { near, wallet, contractAccount, account });
};

export const updateWallet = () => async ({ update, getState }) => {
	const { wallet } = await getState();
	wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2);
	await update('', { wallet });
};
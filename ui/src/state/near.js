import * as nearAPI from 'near-api-js';

export const arbitrageId = "hub.dexgateway.testnet";
export const factoryId = "v4.ftfactory.testnet";

export const {
	utils: {
		format: {
			formatNearAmount, parseNearAmount
		}
	}
} = nearAPI;

const getWallet = async() => {
	const keyStores = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
	const near = await nearAPI.connect({
		networkId: "testnet",
		deps: {
			keyStore: keyStores
		},
		nodeUrl: "https://rpc.testnet.near.org",
		walletUrl: "https://wallet.testnet.near.org",
		helperUrl: "https://helper.testnet.near.org",
		explorerUrl: "https://explorer.testnet.near.org",
		});
	const wallet = new nearAPI.WalletConnection(near);
		
	const contractAccount = new nearAPI.Account(near.connection, arbitrageId);
	return { near, wallet, contractAccount };
}

export const initNear = () => async ({ update }) => {
	const { near, wallet, contractAccount } = await getWallet();
	wallet.signIn = () => {
		wallet.requestSignIn(arbitrageId, 'Near arbitrage');
	};
	const signOut = wallet.signOut;
	wallet.signOut = () => {
		signOut.call(wallet);
		update('wallet.signedIn', false);
		update('', { account: null });
	};

	wallet.signedIn = wallet.isSignedIn();

	let account;
	if (wallet.signedIn) {
		account = wallet.account();
		wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 4);
		await update('', { near, wallet, contractAccount, account });
	}

	await update('', { near, wallet, contractAccount, account });
	await update('app', { mounted: true });
};

export const updateWallet = () => async ({ update, getState }) => {
	const { wallet } = await getState();
	wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2);
	await update('', { wallet });
};
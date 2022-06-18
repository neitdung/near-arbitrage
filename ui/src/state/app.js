import { State } from '../utils/state';

import { initNear } from './near';

const initialState = {
	app: {
		mounted: false,
	},
	near: {
		initialized: false,
	}
};
let snackTimeout;

export const { appStore, AppProvider } = State(initialState, 'app');

export const onAppMount = () => async ({ update, getState, dispatch }) => {
	let nearToUsdReq = await fetch("https://api.diadata.org/v1/foreignQuotation/CoinMarketCap/NEAR");
	let nearToUsdRes = await nearToUsdReq.json();
	update('app', { mounted: true, nearToUsd: nearToUsdRes.Price });
	dispatch(initNear());
};

export const snackAttack = (msg) => async ({ update, getState, dispatch }) => {
	console.log('Snacking on:', msg);
	update('app.snack', msg);
	if (snackTimeout) clearTimeout(snackTimeout);
	snackTimeout = setTimeout(() => update('app.snack', null), 3000);
};
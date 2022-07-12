import { State } from './provider';

import { arbitrageId, initNear } from './near';

const initialState = {
	app: {
		mounted: false,
	},
	near: {
		initialized: false,
	},
	dexs: {
		list: [],
		mounted: false
	},
	tokens: {
		list: [],
		mounted: false
	},
	pools: {
		list: [],
		mounted: false
	},
	contractAccount: {},
	tokenMatrix : {}
};

export const { appStore, AppProvider } = State(initialState, 'app');

export const onAppMount = () => async ({ dispatch }) => {
	dispatch(initNear());
};

export const mountDexs = () => async ({ update, getState }) => {
	const { app, contractAccount } = await getState();
	if (app.mounted) {
		contractAccount
			.viewFunction(arbitrageId, "get_dexs", {
				from_index: 0,
				limit: 100
			}).then(res => {
				update('dexs', { mounted: true, list: res })
			});
	}
}

export const mountPools = (dex_id) => async ({ update, getState }) => {
	const { app, contractAccount } = await getState();
	if (app.mounted) {
		let pools = await contractAccount
			.viewFunction(dex_id, "get_pools", {
				from_index: 0,
				limit: 100
			});
		let tokenMatrix = {};
		let tokenSet = new Set();
		let matrixP = new Promise((resolve, _) => {
			pools.forEach((item, index, array) => {
				let token1 = item.token_account_ids[0];
				let token2 = item.token_account_ids[1];
				tokenSet.add(token1);
				tokenSet.add(token2);
				if (tokenMatrix.hasOwnProperty(token1)) {
					if (tokenMatrix[token1].hasOwnProperty(token2)) {
						tokenMatrix[token1][token2].push(index);
					} else {
						tokenMatrix[token1][token2] = [index];
					}
				} else {
					tokenMatrix[token1] = {};
					tokenMatrix[token1][token2] = [index];
				}

				if (tokenMatrix.hasOwnProperty(token2)) {
					if (tokenMatrix[token2].hasOwnProperty(token1)) {
						tokenMatrix[token2][token1].push(index);
					} else {
						tokenMatrix[token2][token1] = [index];
					}
				} else {
					tokenMatrix[token2] = {};
					tokenMatrix[token2][token1] = [index];
				}
				if( index == array.length -1) resolve();
			});
		});
		matrixP.then(() => {
			update('tokenMatrix', tokenMatrix);
			update('tokens', { list: Array.from(tokenSet), mounted:true})
		})
		update('pools', { mounted: true, list: pools })
	}
}

export const getSteps = (tokenIn, tokenOut, tokenMatrix) => {
	let par = {};
	let visit = [tokenIn];
	let q = [tokenIn];
	while (q.length) {
        let u = q[0];
		q.shift();
		let ku = Object.keys(tokenMatrix[u]);
		for (let v =0; v < ku.length; v++) {
			if (!visit.includes(ku[v])) {
				par[ku[v]] = u;
				visit.push(ku[v]);
				q.push(ku[v]);
			}
		}
	}
	if (!visit.includes(tokenOut)) return [];
	let steps = [];
	while(tokenOut != tokenIn) {
		steps.push(tokenOut);
		tokenOut = par[tokenOut];
	}
	steps.push(tokenIn)
	steps.reverse();
	return steps;
}
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
	}
};

export const { appStore, AppProvider } = State(initialState, 'app');

export const onAppMount = () => async ({ dispatch }) => {
	dispatch(initNear());
};

export const mountDexs = () => async ({ update, getState }) => {
	let timer = 0;
	let snackTimer = setInterval(async () => {
		const { app: { mounted }, contractAccount } = await getState();
		timer++;
		if(timer > 8) clearInterval(snackTimer);
		if (mounted) {
			contractAccount
				.viewFunction(arbitrageId, "get_dexs", {
					from_index: 0,
					limit: 100
				}).then(res => {
					update('dexs', { mounted: true, list: res })
				});
			clearInterval(snackTimer);
		}
	}, 2000)

}
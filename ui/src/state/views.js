import { factoryId, arbitrageId } from "../state/near";

export const getDexs = async (
    contractAccount,
    from_index,
    limit
) => {
    let data = await contractAccount
        .viewFunction(arbitrageId, "get_dexs", {
            from_index: from_index,
            limit: limit,
        })
        .catch((e) => {
            console.log(e);
        });
    return data;
};

export const getPools = async (
    contractAccount,
    from_index,
    limit
) => {
    let data = await contractAccount
        .viewFunction(arbitrageId, "get_dexs", {
            from_index: from_index,
            limit: limit,
        })
        .catch((e) => {
            console.log(e);
        });
    return data;
};

export const loadFungibleTokens = async (
    contractAccount,
    from_index,
    limit
) => {
    let data = await contractAccount
        .viewFunction(factoryId, "get_tokens", {
            from_index: from_index,
            limit: limit,
        })
        .catch((e) => {
            console.log(e);
        });
    return data;
};

export const loadFungibleToken = (contractAccount, ft) => {
    return contractAccount
        .viewFunction(ft, "ft_metadata", {})
        .catch((e) => {
            console.log(e);
        });
};

export const loadNumberTokens = async (contractAccount) => {
    let data = await contractAccount
        .viewFunction(factoryId, "get_number_of_tokens")
        .catch((e) => {
            console.log(e);
            return 0;
        });
    return data ? data : 0;
};

export const loadRequiredDeposit = async (
    contractAccount,
    account_id,
    args
) => {
    let data = await contractAccount
        .viewFunction(factoryId, "get_required_deposit", {
            args: args,
            account_id: account_id,
        })
        .catch((e) => {
            console.log(e);
            return 0;
        });
    return data ? data : 0;
};

export const ftStorage = async (contractAccount, seed_id, account_id) => {
    let data = await contractAccount
        .viewFunction(seed_id, "storage_balance_of", {
            account_id: account_id,
        })
        .catch((e) => {
            return 0;
        });
    return data ? data.total : 0;
};

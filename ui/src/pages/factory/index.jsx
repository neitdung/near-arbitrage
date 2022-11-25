import React, { useContext, useEffect, useState } from "react";
import { appStore, onAppMount } from "src/state/app";
import { loadFungibleTokens, loadNumberTokens } from "src/state/views";
import NextLink from 'next/link';
import TableFTs from "src/components/common/TableFTs";
import { Button, flattenTokens, HStack, VStack } from "@chakra-ui/react";
import { factoryId } from "src/state/near";

export default function Index() {
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const { state, dispatch } = useContext(appStore);
    const [data, setData] = useState([]);
    const { contractAccount, account, app: {mounted} } = state;
    const onMount = () => {
        dispatch(onAppMount());
    };

    useEffect(() => {
        if (isFirstLoading) {
            setIsFirstLoading(false);
            onMount()
        }

    }, [isFirstLoading]);
    useEffect(() => {
        if(mounted) {
            if (account && contractAccount) {
                loadNumberTokens(contractAccount)
                    .then(tokensLength => loadFungibleTokens(contractAccount, 0, tokensLength))
                    .then(fTokens => [fTokens.map(item => item[0] + "." + factoryId), fTokens.map(item => item[1].can_faucet)])
                    .then(([tokens, listFaucet]) => {
                        let promises = [];
                        let newData = [];
                        tokens.forEach(item => {
                            const tokenData = contractAccount.viewFunction(item, 'ft_metadata');
                            const tokenSupply = contractAccount.viewFunction(item, 'ft_total_supply');
                            const tokenBalanceOf = contractAccount.viewFunction(item, 'ft_balance_of', { account_id: account.accountId });
                            promises.push(tokenData);
                            promises.push(tokenSupply);
                            promises.push(tokenBalanceOf);
                        });
                        Promise.all(promises).then(values => {
                            for (let i = 0; i < values.length; i = i + 3) {
                                let newItem = { metadata: values[i], total_supply: values[i + 1], balance_of: values[i + 2], can_faucet: listFaucet[i / 3] };
                                newData.push(newItem);
                            }
                        }).then(() => setData(newData));
                    });
            } else if (contractAccount) {
                loadNumberTokens(contractAccount)
                    .then(tokensLength => loadFungibleTokens(contractAccount, 0, tokensLength))
                    .then(fTokens => (fTokens.map(item => item[0] + "." + factoryId), fTokens.map(item => item[1].can_faucet)))
                    .then((tokens, listFaucet) => {
                        let promises = [];
                        let newData = [];
                        tokens.forEach(item => {
                            const tokenData = contractAccount.viewFunction(item, 'ft_metadata');
                            const tokenSupply = contractAccount.viewFunction(item, 'ft_total_supply');
                            promises.push(tokenData);
                            promises.push(tokenSupply);
                        });
                        Promise.all(promises).then(values => {
                            for (let i = 0; i < values.length; i = i + 2) {
                                let newItem = { metadata: values[i], total_supply: values[i + 1], balance_of: 0, can_faucet: listFaucet[i / 2] };
                                newData.push(newItem);
                            }
                        }).then(() => setData(newData));
                    });
            }
        }
    }, [contractAccount, mounted]);

    return (
        <VStack gap={20}>
            <TableFTs data={data} account={account}/>
        </VStack>
    )
}

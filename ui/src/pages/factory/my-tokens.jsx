import React, { useContext, useEffect, useState } from "react";
import { Button, HStack, Skeleton, VStack } from "@chakra-ui/react";
import { appStore, onAppMount } from "src/state/app";
import NextLink from 'next/link';
import TableFTs from "src/components/common/TableFTs";

export default function MyTokens() {
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const { state, dispatch } = useContext(appStore);
    const [data, setData] = useState([]);

    const { account, contractAccount } = state;

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
        if (account && contractAccount) {
            fetch(`/api/tokens?accountId=${account.accountId}`)
                .then(res => res.json())
                .then(tokens => {
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
                            let newItem = { metadata: values[i], total_supply: values[i + 1], balance_of: values[i + 2] };
                            newData.push(newItem);
                        }
                    }).then(() => setData(newData));
                });
        }
    }, [account, contractAccount]);

    if (!account) return <p>Please connect your NEAR Wallet</p>;

    if (!data) return <Skeleton />

    return (
        <VStack gap={20}>
            <HStack gap={10}>
                <NextLink href={"/factory/my-tokens"} as={"/factory"}>
                    <Button>
                        View my tokens
                    </Button>
                </NextLink>
                <NextLink href={"/factory/create"} as={"/factory/create"}>
                    <Button >
                        Create new token
                    </Button>
                </NextLink>
            </HStack>
            <TableFTs data={data} account={account} />
        </VStack>
    )
}

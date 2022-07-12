import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    Image,
    NumberInputField,
    NumberInput,
    VStack,
    Select,
    Flex
} from "@chakra-ui/react";
import { swapAction, testSwap } from 'src/state/actions';
import { appStore, onAppMount, mountDexs, mountPools, getSwap, getSteps } from 'src/state/app';
import { loadBalance, loadFTMeta } from 'src/state/views';

export default function Index() {
    const { state, dispatch } = useContext(appStore);
    const { app, wallet, account, dexs, tokenMatrix, contractAccount, tokens, pools } = state;
    const onMount = () => {
        dispatch(onAppMount());
    };

    const [dex, setDex] = useState("");
    const [tokenIn, setTokenIn] = useState("");
    const [bIn, setbIn] =useState(0);
    const [bOut, setBOut] = useState(0);
    const [amountIn, setAmountIn] = useState(0);
    const [tokenOut, setTokenOut] = useState("");
    const [amountOut, setAmountOut] = useState(0);
    const [metadatas, setMetadatas] = useState({});
    useEffect(onMount, []);
    useEffect(() => {
        if (app.mounted) {
            dispatch(mountDexs());
        }
    }, [app.mounted]);

    useEffect(() => {
        if (app.mounted && dexs) {
            setDex(dexs.list[0]);
        }
    }, [app.mounted, dexs]);

    useEffect(() => {
        if (app.mounted && dex) {
            dispatch(mountPools(dex));
        }
    }, [app.mounted, dex]);

    useEffect(() => {
        if (tokens.mounted) {
            loadMetadatas();
        }
    }, [tokens.mounted])

    useEffect(() => {
        if(tokenIn && tokenOut && amountIn) {
            let steps = getSteps(tokenIn, tokenOut, tokenMatrix);
            if (!steps) {
                alert("can not swap");
                setTokenOut("");
            } else {
                let poolId1 = tokenMatrix[steps[0]][steps[1]][0];
                let poolId2 = tokenMatrix[steps[steps.length-2]][steps[steps.length-1]][0];
                let totalIn = pools.list[poolId1].token_account_ids[0] == tokenIn ? pools.list[poolId1].amounts[0] : pools.list[poolId1].amounts[1];
                let totalOut = pools.list[poolId2].token_account_ids[0] == tokenOut ? pools.list[poolId2].amounts[0] : pools.list[poolId2].amounts[1];
                const totalK = totalIn * totalOut;
                const changeX = parseInt(totalIn) + parseInt(amountIn);                
                let aOut = totalOut - totalK / changeX;
                setAmountOut(aOut);
            }
        }
    }, [tokenIn, tokenOut, amountIn])

    useEffect(() => {
        if(tokenIn) {
            loadBalance(account, tokenIn)
            .then(res => setbIn(parseInt(res)))
        }
    }, [tokenIn])

    useEffect(() => {
        if (tokenOut) {
            loadBalance(account, tokenOut)
                .then(res => setBOut(parseInt(res)))
        }
    }, [tokenOut])
    const loadMetadatas = async () => {
        let metas = await loadFTMeta(contractAccount, tokens.list);
        let metaObj = {};
        metas.forEach((item, index) => {
            metaObj[tokens.list[index]] = item;
        })
        setMetadatas(metaObj);
    }
    const swap = () => {
        if (tokenIn && tokenOut && amountIn) {
            let steps = getSteps(tokenIn, tokenOut, tokenMatrix);
            if (!steps) {
                alert("can not swap");
            } else {
                let actions = [{
                    pool_id: tokenMatrix[tokenIn][steps[1]][0],
                    token_in: tokenIn,
                    token_out: steps[1],
                    amount_in: amountIn.toString(),
                    min_amount_out: "0",
                }];
                for (let i =1; i<steps.length -1; i++) {
                    actions.push({
                        pool_id: tokenMatrix[steps[i]][steps[i+1]][0],
                        token_in: steps[i],
                        token_out: steps[i+1],
                        min_amount_out: "0",
                    })
                }

                swapAction(account, dex, actions, tokenIn, amountIn);
            }
        }
    }
    return (
        <Center>
            <Box bg="white" p={6} border={'1px solid'} w={'2xl'}>
                <VStack spacing={4} align="flex-start">
                    <FormControl>
                        <FormLabel>Dex</FormLabel>
                        <Select value={dex} onChange={(e) => setDex(e.target.value)}>
                            {(dexs.mounted) && dexs.list.map(item => <option key={`dex${item}`} value={item}>{item}</option>)}
                        </Select>
                    </FormControl>
                    <Flex justify={'space-between'} w={'full'} gap={12}>
                        <FormControl>
                            <FormLabel>Amount In (Balance: {bIn})</FormLabel>
                            <NumberInput value={amountIn}><NumberInputField onChange={(e) => setAmountIn(e.target.value)} /></NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Token In</FormLabel>
                            <Select value={tokenIn} onChange={(e) => setTokenIn(e.target.value)} placeholder="Select token">
                                {(tokens.mounted) && tokens.list.filter(fItem => fItem !== tokenOut)
                                    .map((item) =>
                                        <option key={`tin${item}`} value={item}> {metadatas[item]?.name}</option>
                                    )}
                            </Select>
                        </FormControl>
                        <FormControl w={'min'}>
                            <FormLabel>Symbol</FormLabel>
                            {metadatas[tokenIn]?.icon ? <Image height={"36px"} src={metadatas[tokenIn]?.icon} /> : <Image h={"36px"} src={`https://picsum.photos/30/?random=1`} />}
                        </FormControl>
                    </Flex>
                    <Flex justify={'space-between'} w={'full'} gap={12}>
                        <FormControl>
                            <FormLabel>Amount Out (Balance: {bOut})</FormLabel>
                            <NumberInput value={amountOut} disabled ><NumberInputField onChange={(e) => setAmountOut(e.target.value)} /></NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Token Out</FormLabel>
                            <Select value={tokenOut} onChange={(e) => setTokenOut(e.target.value)} placeholder="Select token">
                                {(tokens.mounted) && tokens.list.filter(fItem => fItem !== tokenIn)
                                    .map(item =>
                                        <option key={`tout${item}`} value={item}>{metadatas[item]?.name}</option>
                                    )}
                            </Select>
                        </FormControl>
                        <FormControl w={'min'}>
                            <FormLabel>Symbol</FormLabel>
                            {metadatas[tokenOut]?.icon ? <Image h={"36px"} src={metadatas[tokenOut]?.icon} /> : <Image h={"36px"} src={`https://picsum.photos/30/?random=2`} />}
                        </FormControl>

                    </Flex>
                    <Flex w={'full'}>
                        <Button type="submit"
                            color={'white'}
                            bgColor='#f5505e'
                            w={'full'}
                            onClick={swap}
                            _hover={{
                                bg: 'pink.300',
                            }}
                        >
                            Swap
                        </Button>
                    </Flex>
                </VStack>
            </Box>
        </Center>
    );
}
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
    Flex,
    Table,
    Thead,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Tbody,
    Avatar,
    HStack,
    Text
} from "@chakra-ui/react";
import { swapAction } from 'src/state/actions';
import { appStore, onAppMount, mountDexs, mountPools, getSwap, getSteps } from 'src/state/app';
import { loadBalance, loadFTMeta, loadPools } from 'src/state/views';
import { ethers, BigNumber } from 'ethers';
import { ArrowRightIcon } from '@chakra-ui/icons';
export default function Index() {
    const { state, dispatch } = useContext(appStore);
    const { app, account, dexs, tokenMatrix, contractAccount, tokens, pools } = state;
    const onMount = () => {
        dispatch(onAppMount());
    };

    const [dex, setDex] = useState("");
    const [tokenIn, setTokenIn] = useState("");
    const [bIn, setBIn] = useState(0);
    const [bOut, setBOut] = useState(0);
    const [amountIn, setAmountIn] = useState(0);
    const [tokenOut, setTokenOut] = useState("");
    const [amountOut, setAmountOut] = useState(0);
    const [metadatas, setMetadatas] = useState({});
    const [dexPools, setDexPools] = useState([]);
    const [swapSteps, setSwapSteps] = useState([]);

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
        if (tokenIn && tokenOut && amountIn) {
            let steps = getSteps(tokenIn, tokenOut, tokenMatrix);
            setSwapSteps(steps);
            if (!steps) {
                alert("can not swap");
                setTokenOut("");
            } else {
                let bigZero = BigNumber.from("0");
                let aIn = ethers.utils.parseUnits(amountIn, metadatas[tokenIn].decimals);
                let poolId = tokenMatrix[steps[0]][steps[1]][0];
                let totalIn1 = pools.list[poolId].token_account_ids[0] == tokenIn ? pools.list[poolId].amounts[0] : pools.list[poolId].amounts[1];
                let totalOut1 = pools.list[poolId].token_account_ids[0] == tokenOut ? pools.list[poolId].amounts[0] : pools.list[poolId].amounts[1];
                let totalK1 = BigNumber.from(totalIn1).mul(BigNumber.from(totalOut1));
                let changeX1 = BigNumber.from(totalIn1).add(aIn);
                if (changeX1.gt(bigZero)) {
                    aIn = BigNumber.from(totalOut1).sub(totalK1.div(changeX1));
                } else {
                    aIn = BigNumber.from("0");
                }
                for (let i = 1; i < steps.length - 1; i++) {
                    let poolId = tokenMatrix[steps[i]][steps[i + 1]][0];
                    let totalIn = pools.list[poolId].token_account_ids[0] == steps[i] ? pools.list[poolId].amounts[0] : pools.list[poolId].amounts[1];
                    let totalOut = pools.list[poolId].token_account_ids[0] == steps[i + 1] ? pools.list[poolId].amounts[0] : pools.list[poolId].amounts[1];
                    let totalK = BigNumber.from(totalIn).mul(BigNumber.from(totalOut));
                    let changeX = BigNumber.from(totalIn).add(aIn);
                    if (changeX.eq(bigZero)) {
                        setAmountOut(0);
                        break;
                    }
                    aIn = BigNumber.from(totalOut).sub(totalK.div(changeX));
                }
                setAmountOut(ethers.utils.formatUnits(aIn, metadatas[tokenOut].decimals));
            }
        } else if (tokenIn && tokenOut) {
            let steps = getSteps(tokenIn, tokenOut, tokenMatrix);
            setSwapSteps(steps);
        }
    }, [tokenIn, tokenOut, amountIn])

    useEffect(() => {
        if (tokenIn) {
            loadBalance(account, tokenIn)
                .then(res => setBIn(res))
        }
    }, [tokenIn])

    useEffect(() => {
        if (tokenOut) {
            loadBalance(account, tokenOut)
                .then(res => setBOut(res))
        }
    }, [tokenOut])

    useEffect(() => {
        if (dex) {
            loadPools(account, dex)
                .then(res => {
                    setDexPools(res)
                })
        }
    }, [dex])
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
                let bigAmount = ethers.utils.parseUnits(amountIn, metadatas[tokenIn].decimals).toString();
                let actions = [{
                    pool_id: tokenMatrix[tokenIn][steps[1]][0],
                    token_in: tokenIn,
                    token_out: steps[1],
                    amount_in: bigAmount,
                    min_amount_out: "0",
                }];
                for (let i = 1; i < steps.length - 1; i++) {
                    actions.push({
                        pool_id: tokenMatrix[steps[i]][steps[i + 1]][0],
                        token_in: steps[i],
                        token_out: steps[i + 1],
                        min_amount_out: "0",
                    })
                }

                if (amountIn > bIn) {
                    alert("Not enough balance");
                } else {
                    swapAction(account, dex, actions, tokenIn, bigAmount);
                }
            }
        }
    }
    return (
        <VStack gap={10}>
            <Box bg="white" p={6} border={'1px solid'} w={'3xl'}>
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
                    <Center w={'full'}>
                        {(swapSteps.length) ? swapSteps.map((item, index) =>
                            <HStack gap={1} pr={4}>
                                <Avatar size='sm' src={metadatas[item]?.icon} />
                                {(index !== swapSteps.length - 1) && <ArrowRightIcon color='teal' />}
                            </HStack>
                        ) : null}
                    </Center>
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
            <TableContainer border={'1px solid'} w={'full'} maxW={'6xl'}>
                <Table variant='striped' colorScheme='teal'>
                    <TableCaption>Pool Info</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>#</Th>
                            <Th>Pair</Th>
                            <Th>TVL</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {dexPools.length && dexPools.map((row, index) => (
                            <Tr
                                key={`pool-${index}-${dex}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <Td>{index}</Td>
                                <Td>
                                    <HStack>
                                        <Avatar size='sm' src={metadatas[row.token_account_ids[0]]?.icon} />
                                        <Avatar size='sm' src={metadatas[row.token_account_ids[1]]?.icon} />
                                        <Text pl={2} fontWeight={600}>{metadatas[row.token_account_ids[0]]?.symbol} - {metadatas[row.token_account_ids[1]]?.symbol}</Text>
                                    </HStack>
                                </Td>
                                <Td>
                                    <HStack>
                                        <Text>{parseFloat(ethers.utils.formatUnits(row?.amounts[0], metadatas[row.token_account_ids[0]]?.decimals)).toFixed(2)}</Text>
                                        <Avatar size='xs' src={metadatas[row.token_account_ids[0]]?.icon} />
                                        <Text>-</Text>
                                        <Text>{parseFloat(ethers.utils.formatUnits(row?.amounts[1], metadatas[row.token_account_ids[1]]?.decimals)).toFixed(2)}</Text>
                                        <Avatar size='xs' src={metadatas[row.token_account_ids[1]]?.icon} />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </VStack>
    );
}
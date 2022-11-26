import React, { useCallback, useContext, useEffect, useState } from 'react';
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
    Text,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    useDisclosure,
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
    const { isOpen: openTokenIn, onToggle: toggleTokenIn, onClose: closeTokenIn } = useDisclosure();
    const { isOpen: openTokenOut, onToggle: toggleTokenOut, onClose: closeTokenOut } = useDisclosure();

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

                if (parseFloat(amountIn) > bIn) {
                    console.log(amountIn, bIn)
                    alert("Not enough balance");
                } else {
                    swapAction(account, dex, actions, tokenIn, bigAmount);
                }
            }
        }
    }

    const handleSelectTokenIn = useCallback(value => {
        setTokenIn(value);
        closeTokenIn();
    }, []);

    const handleSelectTokenOut = useCallback(value => {
        setTokenOut(value);
        closeTokenOut();
    }, []);
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
                            <FormLabel>Amount In</FormLabel>
                            <NumberInput value={amountIn}><NumberInputField onChange={(e) => setAmountIn(e.target.value)} /></NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Token In</FormLabel>
                            <Popover
                                matchWidth
                                isOpen={openTokenIn}
                                onClose={closeTokenIn}
                            >
                                <PopoverTrigger w='full'>
                                    <Button
                                        w='full'
                                        justifyContent='left'   
                                        aria-label='Options token in'
                                        variant='outline'
                                        onClick={toggleTokenIn}
                                        leftIcon={<Avatar size='xs' src={metadatas[tokenIn]?.icon} name={metadatas[tokenIn]?.symbol} />}
                                    >
                                        <Text>{metadatas[tokenIn]?.symbol}</Text>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent w='full'>
                                    <PopoverBody w='full'>
                                        <VStack w='full'>
                                            {(tokens.mounted) && tokens.list.filter(fItem => fItem !== tokenOut)
                                                .map((item, index) =>
                                                    <Button
                                                        w='full'
                                                        justifyContent='left'
                                                        key={`token-option-in-${index}`}
                                                        leftIcon={<Avatar size='xs' src={metadatas[item]?.icon} name={metadatas[item]?.name} />}
                                                        onClick={() => { handleSelectTokenIn(item) }}
                                                    >
                                                        <Text>{metadatas[item]?.symbol}</Text>
                                                    </Button>
                                                )}
                                        </VStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormControl w={'min'}>
                            <FormLabel>Balance</FormLabel>
                            {bIn}
                        </FormControl>
                    </Flex>
                    <Flex justify={'space-between'} w={'full'} gap={12}>
                        <FormControl>
                            <FormLabel>Amount Out</FormLabel>
                            <NumberInput value={amountOut} disabled ><NumberInputField onChange={(e) => setAmountOut(e.target.value)} /></NumberInput>
                        </FormControl>
                        <FormControl w='full'>
                            <FormLabel>Token Out</FormLabel>
                            <Popover
                                matchWidth
                                w='full'
                                isOpen={openTokenOut}
                                onClose={closeTokenOut}
                            >
                                <PopoverTrigger w='full'>
                                    <Button
                                        w='full'
                                        justifyContent='left'
                                        aria-label='Options token in'
                                        variant='outline'
                                        onClick={toggleTokenOut}
                                        leftIcon={<Avatar size='xs' src={metadatas[tokenOut]?.icon} name={metadatas[tokenOut]?.symbol} />}
                                    >
                                        <Text>{metadatas[tokenOut]?.symbol}</Text>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent w='full'>
                                    <PopoverBody>
                                        <VStack w='full'>
                                            {(tokens.mounted) && tokens.list.filter(fItem => fItem !== tokenIn)
                                                .map((item, index) =>
                                                    <Button
                                                        w='full'
                                                        justifyContent='left'
                                                        key={`token-option-in-${index}`}
                                                        leftIcon={<Avatar size='xs' src={metadatas[item]?.icon} name={metadatas[item]?.name} />}
                                                        onClick={() => { handleSelectTokenOut(item) }}
                                                    >
                                                        <Text>{metadatas[item]?.symbol}</Text>
                                                    </Button>
                                                )}
                                        </VStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormControl w={'min'}>
                            <FormLabel>Balance</FormLabel>
                            {bOut}
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
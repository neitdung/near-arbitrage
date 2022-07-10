import React, { useContext, useEffect, useState } from 'react';
import { Formik, Field, useFormik } from "formik";
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
    HStack,
    Select,
    Flex
} from "@chakra-ui/react";
import { testSwap } from 'src/state/actions';
import { appStore, onAppMount, mountDexs } from 'src/state/app';

export default function Index() {
    const { state, dispatch } = useContext(appStore);
    const { wallet, account, dexs } = state;

    const onMount = () => {
        dispatch(onAppMount());
        dispatch(mountDexs());
    };
    useEffect(onMount, []);

    const swap = () => {
        testSwap(account);
    }
    return (
        <Center>
            <Box bg="white" p={6} border={'1px solid'} w={'xl'}>
                <Formik
                    initialValues={{
                        dex_id: '',
                        pair_index: 0,
                        token_in: 0,
                        token_out: 0,
                    }}
                    onSubmit={swap}
                >
                    {({ handleSubmit, errors }) => (
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="flex-start">
                                <Flex justify={'space-between'} w={'full'} gap={12}>
                                    <FormControl>
                                        <FormLabel htmlFor="dex">Dex</FormLabel>
                                        <Field
                                            as={Select}
                                            id='dex'
                                            name={'dex_id'}
                                        >
                                            {(dexs.mounted) && dexs.list.map(item => <option value={item}>{item}</option>)}
                                        </Field>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="address">Pool</FormLabel>
                                        <Field
                                            as={Input}
                                            id="pool"
                                            name="pool_id"
                                        />
                                    </FormControl>
                                </Flex>
                                <FormControl isInvalid={!!errors.name}>
                                    <FormLabel htmlFor="name">Token In</FormLabel>
                                    <Field
                                        as={Input}
                                        id="token_in"
                                        name="token_in"

                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="email">Token Out</FormLabel>
                                    <Field
                                        as={Input}
                                        id="token_out"
                                        name="token_out"

                                    />
                                </FormControl>
                                <Flex w={'full'}>
                                    <Button type="submit"
                                        color={'white'}
                                        bgColor='#f5505e'
                                        w={'full'}
                                        _hover={{
                                            bg: 'pink.300',
                                        }}
                                    >
                                        Swap
                                    </Button>
                                </Flex>
                            </VStack>
                        </form>
                    )}
                </Formik>
            </Box>
        </Center>
    );
}
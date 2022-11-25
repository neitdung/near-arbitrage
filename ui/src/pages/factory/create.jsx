import React, { useContext, useEffect, useState, useCallback } from 'react';
import { appStore, onAppMount } from 'src/state/app';
import { useDropzone } from 'react-dropzone';
import { useFormik } from "formik";
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Flex,
    Switch,
    Image,
    Divider
} from "@chakra-ui/react";
import NotLoggedIn from "src/components/common/NotLoggedIn";
import { createNewFT } from 'src/state/actions';
import minifySvg from 'mini-svg-data-uri';
import { ethers } from 'ethers';

const Create = () => {
    const { state, dispatch } = useContext(appStore);
    const { wallet, account } = state;

    const onMount = () => {
        dispatch(onAppMount());
    };
    useEffect(onMount, []);

    const signedIn = ((wallet && wallet.signedIn));

    const formik = useFormik({
        initialValues: {
            owner_id: '',
            total_supply: '',
            can_faucet: false,
            metadata: {
                spec: 'ft-1.0.0',
                name: '',
                icon: '',
                symbol: '',
                decimals: 18
            }
        },
        onSubmit: values => { submitFT(values) }
    });
    const submitFT = values => {
        let bigTotalSupply = ethers.utils.parseUnits(values.total_supply, values.metadata.decimals);
        createNewFT(account, {...values, total_supply: bigTotalSupply.toString()});
    }
    const onDrop = useCallback(acceptedFiles => {
        let file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            formik.setFieldValue('metadata.icon', minifySvg(reader.result))
        }
        reader.readAsText(file)
        // );
    }, []);

    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: 'image/svg+xml',
        maxFiles: 1,
        maxSize: 4096,
        onDrop
    });

    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
            <ul>
                {errors.map(e => (
                    <li key={e.code}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    if (!signedIn) return <NotLoggedIn />
    return (
        <Box>
            {
                signedIn &&
                <Center>
                    <Box bg="white" p={6} border={'1px solid'} w={'xl'}>
                        <form onSubmit={formik.handleSubmit}>
                            <VStack spacing={4} align="flex-start">
                                <Flex justify={'space-between'} w={'full'} gap={12}>
                                    <FormControl>
                                        <FormLabel htmlFor="owner_id">Owner ID</FormLabel>
                                        <Input
                                        required
                                            onChange={formik.handleChange}
                                            value={formik.values.owner_id}
                                            id="owner_id"
                                            name="owner_id"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="total_supply">Total Supply</FormLabel>
                                        <Input
                                                required
                                            onChange={formik.handleChange}
                                            value={formik.values.total_supply}
                                            id="total_supply"
                                            name="total_supply"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="can_faucet">Can faucet</FormLabel>
                                        <Switch
                                            onChange={formik.handleChange}
                                            value={formik.values.can_faucet}
                                            size='lg'
                                            id="can_faucet"
                                            name="can_faucet"
                                        />
                                    </FormControl>
                                </Flex>
                                <Flex justify={'space-between'} w={'full'} gap={12}>
                                    <FormControl>
                                        <FormLabel htmlFor="spec">Spec</FormLabel>
                                        <Input
                                                required
                                            onChange={formik.handleChange}
                                            value={formik.values.metadata.spec}
                                            id="spec"
                                            name="metadata.spec"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <Input
                                                required
                                            onChange={formik.handleChange}
                                            value={formik.values.metadata.name}
                                            id="name"
                                            name="metadata.name"

                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="symbol">Symbol</FormLabel>
                                        <Input
                                                required
                                            onChange={formik.handleChange}
                                            value={formik.values.metadata.symbol}

                                            id="symbol"
                                            name="metadata.symbol"

                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel htmlFor="decimals">Decimals</FormLabel>
                                        <Input
                                                required
                                            onChange={formik.handleChange}
                                            value={formik.values.metadata.decimals}
                                            type={'number'}
                                            id="decimals"
                                            name="metadata.decimals"
                                        />
                                    </FormControl>
                                </Flex>
                                <Flex border={'4px dashed'} borderColor={'pink.300'} gap={5} w={'full'} p={5}>
                                    <Box w='full' {...getRootProps()} textAlign='left' >
                                            <strong>Icon</strong>
                                        <input {...getInputProps()} />
                                        <p>Drag 'n' drop some files here, or click to select files</p>
                                        <em>(Only *.svg images will be accepted)</em>
                                        <em>(Max sizes: 2kB)</em>
                                    </Box>
                                    <Divider orientation='vertical' h={'initial'}/>
                                    <Box minW={'50'}>
                                        {formik.values.metadata.icon && <Image height={"100px"} src={formik.values.metadata.icon} />}
                                    </Box>
                                </Flex>
                                <FormControl>
                                    <Input
                                        onChange={formik.handleChange}
                                        value={formik.values.metadata.icon}
                                        id="icon"
                                        name="metadata.icon"
                                        hidden
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
                                        Create new FT
                                    </Button>
                                </Flex>
                            </VStack>
                        </form>
                    </Box>
                </Center>}
        </Box>
    )
};

export default Create;

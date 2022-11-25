

import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Flex,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    Portal,
    VStack,
    useToast
} from '@chakra-ui/react'

import { appStore, onAppMount } from 'src/state/app';
import NextLink from 'next/link';
import { Icon } from '@chakra-ui/react';
const WalletIcon = (props) => {
    return (
        <Icon viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                fillRule="evenodd" clipRule="evenodd" d="M0 5C0 3.34315 1.34315 2 3 2H19C20.6569 2 22 3.34315 22 5V6.17071C23.1652 6.58254 24 7.69378 24 9V19C24 20.6569 22.6569 22 21 22H3C1.34314 22 0 20.6569 0 19V5ZM2 7.82929V19C2 19.5523 2.44772 20 3 20H21C21.5523 20 22 19.5523 22 19V17H19C17.3431 17 16 15.6569 16 14C16 12.3431 17.3431 11 19 11H22V9C22 8.44771 21.5523 8 21 8H3C2.64936 8 2.31278 7.93985 2 7.82929ZM22 13H19C18.4477 13 18 13.4477 18 14C18 14.5523 18.4477 15 19 15H22V13ZM20 6H3C2.44772 6 2 5.55228 2 5C2 4.44772 2.44772 4 3 4H19C19.5523 4 20 4.44772 20 5V6Z"
            />
        </Icon>
    );
}

export default function AppBar() {
    const [profile, setProfile] = useState(false);
    const [copied, setCopied] = useState(false);

    const { state, dispatch } = useContext(appStore);

    const { wallet, account } = state;
    const signedIn = wallet && wallet.signedIn;
    const toast = useToast();
    if (profile && !signedIn) {
        setProfile(false);
    }
    const onMount = () => {
        dispatch(onAppMount());
    }
    useEffect(onMount, []);

    const handleLogin = () => {
        wallet.signIn();
    }

    const handleLogout = () => {
        wallet.signOut();
    }

    const copyAddress = async () => {
        if (account.accountId) {
            await navigator.clipboard.writeText(account.accountId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast(
                {title: 'Copied',
                status: 'success',
                duration: 9000,
                isClosable: true,}
            )
        }
    }
    return (
        <Box px={'10vw'} py={10}>
            <Flex justify={'end'}>
                {(!signedIn) ?
                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        fontSize={'sm'}
                        fontWeight={600}
                        color={'white'}
                        bgGradient='linear(to-r, #f5505e, #ef1399)'
                        href={'#'}
                        onClick={handleLogin}
                        leftIcon={<WalletIcon />}
                        _hover={{
                            bg: 'pink.300',
                        }}>
                        Connect Wallet
                    </Button> :
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                display={{ base: 'none', md: 'inline-flex' }}
                                fontSize={'sm'}
                                fontWeight={600}
                                color={'white'}
                                bgGradient='linear(to-r, #f5505e, #ef1399)'
                                href={'#'}
                                leftIcon={<WalletIcon />}
                                _hover={{
                                    bg: 'pink.300',
                                }}>
                                {account.accountId}
                            </Button>
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent w={'min'}>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody>
                                <VStack>
                                    <Button colorScheme='purple' w={'full'} onClick={copyAddress}>Copy Address</Button>
                                    <Button colorScheme='red' w={'full'} onClick={handleLogout}>Logout</Button>
                                </VStack>
                            </PopoverBody>
                            </PopoverContent>
                        </Portal>
                        </Popover>
                }
            </Flex>
        </Box>
    )
}
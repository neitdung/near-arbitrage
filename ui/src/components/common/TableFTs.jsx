import React from "react";
import {
    Table,
    Thead,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Tbody,
    Image,
    Button,
    Avatar
} from '@chakra-ui/react';
import { faucetFT, depositFT } from "src/state/actions";
import { factoryId } from "src/state/near";
import { ethers } from "ethers";
export default function TableFTs({ data, account }) {
    const faucet = (seed) => {
        if(account) {
            faucetFT(account, seed);
        } else {
            alert("Please login first");
        }
    }
    const deposit = (seed) => {
        if (account) {
            depositFT(account, seed);
        } else {
            alert("Please login first");
        }
    }
    return (
        <TableContainer border={'1px solid'} w={'full'} maxW={'6xl'}>
            <Table variant='striped' colorScheme='teal'>
                <TableCaption>Fungible tokens by factory</TableCaption>
                <Thead>
                    <Tr>
                        <Th>Icon</Th>
                        <Th>Symbol</Th>
                        <Th>Name</Th>
                        <Th>Balance</Th>
                        <Th isNumeric>Total supply</Th>
                        <Th>Faucet</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data && data.map((row, index) => (
                        <Tr
                            key={row.metadata.symbol}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <Td component="th" scope="row">
                                {row.metadata.icon ? <Avatar size='sm' src={row.metadata.icon} /> : <img src={`https://picsum.photos/50/?random=${index}`} />}
                            </Td>
                            <Td>{row.metadata.symbol}</Td>
                            <Td>{row.metadata.name}</Td>
                            <Td>{ethers.utils.formatUnits(ethers.BigNumber.from(row.balance_of), row.metadata.decimals)}</Td>
                            {/* <Td isNumeric>{row.total_supply}</Td> */}
                            <Td isNumeric>{ethers.utils.formatUnits(ethers.BigNumber.from(row.total_supply), row.metadata.decimals)}</Td>
                            <Td isNumeric>{row.can_faucet ? <Button onClick={() => faucet(row.metadata.symbol.toLowerCase() + '.' + factoryId)}>Faucet</Button> : <Button onClick={() => deposit(row.metadata.symbol.toLowerCase() + '.' + factoryId)}>Deposit</Button>}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
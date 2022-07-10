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
    Button
} from '@chakra-ui/react';
import { faucetFT } from "src/state/actions";
import { factoryId } from "src/state/near";
export default function TableFTs({ data, account }) {
    const faucet = (seed) => {
        if(account) {
            faucetFT(account, seed);
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
                                {row.metadata.icon ? <Image height={50} src={row.metadata.icon} /> : <img src={`https://picsum.photos/50/?random=${index}`} />}
                            </Td>
                            <Td>{row.metadata.symbol}</Td>
                            <Td>{row.metadata.name}</Td>
                            <Td>{row.balance_of}</Td>
                            <Td isNumeric>{row.total_supply}</Td>
                            <Td isNumeric>{row.can_faucet && <Button onClick={() => faucet(row.metadata.symbol.toLowerCase()+'.'+factoryId)}>Faucet</Button>}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
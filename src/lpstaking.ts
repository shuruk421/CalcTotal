import { lpAddresses, lpContractABI, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')
let web3 = new Web3(providerAddress);
/*
export async function GetLPStaking(balances:any) {
    for (let i = 0; i < lpAddresses.length; i++) {
        let txs = await getLPTransactions(lpAddresses[i], 1, 'latest');
        balances = await SumLPAddress(balances, lpAddresses[i], txs);
    }
    return balances;
}
*/
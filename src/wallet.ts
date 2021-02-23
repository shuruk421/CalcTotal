import { lpAddresses, lpContractABI, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')

let web3 = new Web3(providerAddress);

export async function getWalletTransactions(addr:any, from:any, to:any) {
    let tokenContract = new web3.eth.Contract(tokenABI, addr);
    let promise = tokenContract.getPastEvents("Transfer", //promise for lp contract
        {
            fromBlock: from,
            toBlock: to
        }); //make event promise
    return promise;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPastEvents(address: any, fromBlock: any, toBlock: any) { //for more than 10000
    let tokenContract = new web3.eth.Contract(tokenABI, address);
    let promises = [];
    let txs: any = [];
    let skipAmount = 1000; // seems to not get overwhelmed
    for (let index = fromBlock; index < toBlock - skipAmount; index += skipAmount) {
        promises.push(tokenContract.getPastEvents("Transfer", //promise for lp contract
            {
                fromBlock: index,
                toBlock: index + skipAmount
            }).then((res:any) => txs = txs.concat(res)));
    }
    await Promise.all(promises);
    return txs;
}


export async function SumTokenAddress(balances:any, addr:any, txs:any) {
    txs.forEach((tx:any) => {
        let from = tx.returnValues.from.toLowerCase();
        let to = tx.returnValues.to.toLowerCase();
        let amount = +tx.returnValues.value;
        if (balances[from] == null)
            balances[from] = 0;
        if (balances[to] == null)
            balances[to] = 0;
        balances[from] = balances[from] - amount;
        balances[to] = balances[to] + amount;
    });
    return balances;
}

export async function GetWallet(balances:any, fromBlock:any) {
    let latest = await web3.eth.getBlock("latest");
    let txs = await getPastEvents(tokenAddress, fromBlock, latest.number);
    balances = await SumTokenAddress(balances, tokenAddress, txs);
    return balances;
}
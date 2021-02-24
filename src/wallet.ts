import { lpAddresses, lpContractABI, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')

let web3 = new Web3(providerAddress);

export async function getWalletTransactions(addr: any, from: any, to: any) {
    let tokenContract = new web3.eth.Contract(tokenABI, addr);
    let promise = tokenContract.getPastEvents("Transfer", //promise for lp contract
        {
            fromBlock: from,
            toBlock: to
        }); //make event promise
    return promise;
}

async function getAddresses(addresses:any, contractAddress: any, fromBlock: any, toBlock: any) {
    let tokenContract = new web3.eth.Contract(tokenABI, contractAddress);
    await tokenContract.getPastEvents("Transfer", //promise for lp contract
        {
            fromBlock: fromBlock,
            toBlock: toBlock
        }).then((res: any) => {
            res.forEach((tx: any) => {
                if (!addresses.includes(tx.returnValues.to))
                    addresses.push(tx.returnValues.to);
            });
        });
    return addresses;
}

async function getPastEvents(contractAddress: any, fromBlock: any, toBlock: any) { //for more than 10000
    let addresses: any = [];
    let promises: any = [];
    let skipAmount = 1000; // seems to not get overwhelmed
    for (let index = fromBlock; index < toBlock - skipAmount; index += skipAmount) {
        promises.push(getAddresses(addresses, contractAddress, index, index + skipAmount).then(res => {
            addresses = res;
        }));
    }
    await Promise.all(promises);
    return addresses;
}


export async function SumTokenAddress(contractAddress: any, balances: any, addrs: any) {
    let tokenContract = new web3.eth.Contract(tokenABI, contractAddress);
    let promises: any = [];
    addrs.forEach((addr: any) => {
        if (balances[addr] == null)
            balances[addr] = 0;
        promises.push(tokenContract.methods.balanceOf(addr).call().then((balance: any) => {
            balances[addr] += +balance;
        }));
    });
    await Promise.all(promises);
    return balances;
}

export async function GetWallet(balances: any, fromBlock: any) {
    let latest = await web3.eth.getBlock("latest");
    let addrs = await getPastEvents(tokenAddress, fromBlock, latest.number);
    balances = await SumTokenAddress(tokenAddress, balances, addrs);
    return balances;
}
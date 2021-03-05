import { lpAddresses, lpContractABI, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')
let web3 = new Web3(providerAddress);

export async function getLPAddresses(addr: any, from: any, to: any) {
    let addresses: any = [];
    let lpContract = new web3.eth.Contract(lpContractABI, addr);
    let res = await lpContract.getPastEvents("Transfer", //promise for lp contract
        {
            fromBlock: from,
            toBlock: to
        });
    res.forEach((tx: any) => {
        if (!addresses.includes(tx.returnValues.to))
            addresses.push(tx.returnValues.to);
    });
    return addresses;
}

export async function GetTotalSupply(abi: any, addr: any) {
    let lpContract = new web3.eth.Contract(abi, addr);
    return lpContract.methods.totalSupply().call();
}

export async function GetBalanceOf(abi: any, contractAddr: any, addr: any) {
    let lpContract = new web3.eth.Contract(abi, contractAddr);
    return lpContract.methods.balanceOf(addr).call();
}

export async function SumLPAddress(balances: any, contractAddress: any, addresses: any) {
    let promises: any = [];
    addresses.forEach((addr: any) => {
        addr = addr.toLowerCase();
        if (balances[addr] == null)
            balances[addr] = 0;
        promises.push(GetBalanceOf(lpContractABI, contractAddress, addr).then(bal => {
            balances[addr] += +bal;
        }));
    });
    await Promise.all(promises);
    let TotalLP = await GetTotalSupply(lpContractABI, contractAddress);
    let TotalTokensOnLp = await GetBalanceOf(tokenABI, tokenAddress, contractAddress);
    for (let key in balances) {
        balances[key] = balances[key] * +TotalTokensOnLp / +TotalLP //SubjectLp * TotalTokensOnLp / TotalLp
    }
    return balances;
}

export async function GetLP(balances: any) {
    for (let i = 0; i < lpAddresses.length; i++) {
        let addresses = await getLPAddresses(lpAddresses[i], 1, 'latest');
        balances = await SumLPAddress(balances, lpAddresses[i], addresses);
    }
    return balances;
}


import { lpAddresses, lpContractABI, lpStakingAddresses, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')
let web3 = new Web3(providerAddress);

export async function getLPAddress(addresses: any, addr: any, from: any, to: any) {
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

export async function getLPAddresses() {
    let addresses: any = [];
    for (let i = 0; i < lpAddresses.length; i++) {
        addresses = await getLPAddress(addresses, lpAddresses[i], 1, 'latest');
    }
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

export async function ApplyLPRatio(balances: any, contractAddress: any) {
    let TotalLP = await GetTotalSupply(lpContractABI, contractAddress);
    let TotalTokensOnLp = await GetBalanceOf(tokenABI, tokenAddress, contractAddress);
    for (let key in balances) {
        balances[key] = balances[key] * +TotalTokensOnLp / +TotalLP //SubjectLp * TotalTokensOnLp / TotalLp
    }
    return balances;
}

export async function SumLPAddress(balances: any, addresses: any) {
    let promises: any = [];
    lpAddresses.forEach(contractAddr => {
        addresses.forEach((addr: any) => {
            addr = addr.toLowerCase();
            if (balances[addr] == null)
                balances[addr] = 0;
            promises.push(GetBalanceOf(lpContractABI, contractAddr, addr).then(bal => {
                balances[addr] += +bal;
            }));
        });
    });
    await Promise.all(promises);

    return balances;
}

export async function GetLP(balances: any) {
    let addresses = await getLPAddresses();
    balances = await SumLPAddress(balances, addresses);
    return balances;
}
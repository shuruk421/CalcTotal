import { lpAddresses, lpContractABI, providerAddress, tokenABI, tokenAddress } from './constants';

const Web3 = require('web3')
let web3 = new Web3(providerAddress);

export async function getLPTransactions(addr:any, from:any, to:any) {
    let lpContract = new web3.eth.Contract(lpContractABI, addr);
    let lppromise = lpContract.getPastEvents("Transfer", //promise for lp contract
        {
            fromBlock: from,
            toBlock: to
        }); //make event promise
    return lppromise;
}

export async function GetTotalSupply(abi:any, addr:any) {
    let lpContract = new web3.eth.Contract(abi, addr);
    return lpContract.methods.totalSupply().call();
}

export async function GetBalanceOf(abi:any, contractAddr:any, addr:any) {
    let lpContract = new web3.eth.Contract(abi, contractAddr);
    return lpContract.methods.balanceOf(addr).call();
}

export async function SumLPAddress(balances:any, addr:any, txs:any) {
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
    let TotalLP = await GetTotalSupply(lpContractABI, addr);
    let TotalTokensOnLp = await GetBalanceOf(tokenABI, tokenAddress, addr);
    for (let key in balances) {
        balances[key] = balances[key] * +TotalTokensOnLp / +TotalLP //SubjectLp * TotalTokensOnLp / TotalLp
    }
    return balances;
}

export async function GetLP(balances:any) {
    for (let i = 0; i < lpAddresses.length; i++) {
        let txs = await getLPTransactions(lpAddresses[i], 1, 'latest');
        balances = await SumLPAddress(balances, lpAddresses[i], txs);
    }
    return balances;
}


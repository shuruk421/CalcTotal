import { lockedSupplyAddresses, stakingContractABI, providerAddress, benefitAddress, benefitContractABI } from './constants';

const Web3 = require('web3')

let web3 = new Web3(providerAddress);
export async function getStakingTransactions(address:any, from:any, to:any) {
    let promises = []; // promises for locked supply addresses
    let stakingContract = new web3.eth.Contract(stakingContractABI, address);
    promises.push(stakingContract.getPastEvents("Staked", //promise for staked
        {
            fromBlock: from,
            toBlock: to
        })); //make event promise;
    promises.push(stakingContract.getPastEvents("PaidOut", //promises for paidout
        {
            fromBlock: from,
            toBlock: to
        })); //make event promise;
    promises.push(stakingContract.getPastEvents("Refunded", //promises for refunded
        {
            fromBlock: from,
            toBlock: to
        })); //make event promise;
    return Promise.all(promises);
}

export async function SumStakingAddresses(balances:any, addresses:any) {
    let promises:any = [];
    let addressList:any = [];
    addresses.forEach((txs:any) => {
        txs.forEach((tx:any) => {
            let staker = tx.returnValues.staker_.toLowerCase();
            if (!addressList.includes(staker))
                addressList.push(staker);
        })
    })

    lockedSupplyAddresses.forEach(supplyAddress => {
        let benefitContract = new web3.eth.Contract(benefitContractABI, supplyAddress);
        addressList.forEach((address:any) => {
            promises.push(benefitContract.methods.stakeOf(address).call().then((res:any) => {
                if (balances[address] == null)
                    balances[address] = 0;
                balances[address] += +res;
            }));
        });
    });
    
    await Promise.all(promises);
    return balances;
}

export async function GetStaking(balances:any) {
    for (let i = 0; i < lockedSupplyAddresses.length; i++) {
        let txs = await getStakingTransactions(lockedSupplyAddresses[i], 1, 'latest')
        balances = await SumStakingAddresses(balances, txs);
    }
    return balances;
}
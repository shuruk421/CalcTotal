import { lockedSupplyAddresses, stakingContractABI, providerAddress, benefitContractABI } from './constants';

const Web3 = require('web3')

let web3 = new Web3(providerAddress);

export async function getStakingAddress(address: any, from: any, to: any) {
    let stakingContract = new web3.eth.Contract(stakingContractABI, address);
    return stakingContract.getPastEvents("Staked", //promise for staked
        {
            fromBlock: from,
            toBlock: to
        }); //make event promise;
}


export async function getStakingAddresses(from: any, to: any) {
    let promises: any = [];
    let addressList: any = [];
    lockedSupplyAddresses.forEach(addr => {
        promises.push(getStakingAddress(addr, from, to).then((txs: any) => {
            txs.forEach((tx: any) => {
                let staker = tx.returnValues.staker_.toLowerCase();
                if (!addressList.includes(staker))
                    addressList.push(staker);
            })
        }));
    });
    await Promise.all(promises);
    return addressList;
}

export async function SumStakingAddresses(balances: any, addressList: any) {
    let promises: any = [];
    lockedSupplyAddresses.forEach(supplyAddress => {
        let benefitContract = new web3.eth.Contract(benefitContractABI, supplyAddress);
        addressList.forEach((address: any) => {
            address = address.toLowerCase();
            promises.push(benefitContract.methods.stakeOf(address).call().then((res: any) => {
                if (balances[address] == null)
                    balances[address] = 0;
                balances[address] += +res;
            }));
        });
    });

    await Promise.all(promises);
    return balances;
}

export async function GetStaking(balances: any) {
    let addressList = await getStakingAddresses(1, 'latest');
    balances = await SumStakingAddresses(balances, addressList);
    return balances;
}
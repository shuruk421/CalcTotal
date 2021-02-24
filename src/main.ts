
import Web3 from 'web3';
import * as LP from './lp';
import * as Staking from './staking';
import * as Wallet from './wallet';
import { providerAddress, tokenStartBlock, decimals } from './constants';

let web3 = new Web3(providerAddress);

interface Addr {
  addr: string;
  total: number;
  winnings: any[];
}

export async function RandomizeWinnings(balances: any, tiers: any, totalWin: number) {
  var addrs: { [address: string]: Addr; } = {}; //create addr dictionary by address
  for (let key in balances) {
    let value = balances[key];
    addrs[key] = { addr: key, total: value, winnings: [] };
  }
  tiers.forEach((tier: any, index: number) => {
    let possibleTakers: any[] = [];
    for (let key in balances) {
      let value = balances[key];
      if (value > +tier.minPoolz * Math.pow(10, decimals)) { // add decimals and check min poolz
        possibleTakers.push(key);
      }
      addrs[key].winnings.push({ name: tier.name, winAmount: 0 });
    }
    // Shuffle array
    const shuffled = possibleTakers.sort(() => 0.5 - Math.random());
    // Get sub-array of first n elements after shuffled
    let selected = shuffled.slice(0, +tier.numOfWinners);
    let winAmount = +totalWin * +tier.allocation / 100 / tier.numOfWinners; // split between holders
    selected.forEach(winner => {
      addrs[winner].winnings[index] = { name: tier.name, winAmount: winAmount }; //append to array
    });
  });
  let result = Object.values(addrs); // no need to return keys
  return result;
}

export async function toCSV(data: any, tiers: any) {
  let csv = '"Address","Total",';
  tiers.forEach((tier: any) => {
    csv += '"' + tier.name + '",'
  })
  data.forEach((addr: any) => {
    csv += '\n"' + addr.addr + '",' + '"' + addr.total + '",';
    tiers.forEach((tier: any, index: any) => {
      csv += '"' + addr.winnings[index].winAmount + '",';
    })
  });
  return csv;
}

export async function calcTotal(getLP: any, getStaking: any, getWallet: any) {
  var balances: { [address: string]: number; } = {};
  if (getLP)
    balances = await LP.GetLP(balances);

  if (getStaking)
    balances = await Staking.GetStaking(balances);

  if (getWallet)
    balances = await Wallet.GetWallet(balances, tokenStartBlock); // token first block

  balances = await CleanBalances(balances);
  return balances;
}

export async function CleanBalances(balances: any) {
  let promises = [];
  for (let key in balances) {
    let value = balances[key];
    if(key == '0x0000000000000000000000000000000000000000')
      delete balances[key];
    else if (value == 0) // clean 0s
      delete balances[key];
    else
      promises.push(web3.eth.getCode(key).then(code => {
        if (code != '0x') // if contract
          delete balances[key];
      }));
  }
  await Promise.all(promises);
  var items = Object.keys(balances).map(function (key) {
    return [key, balances[key]];
  });
  items.sort(function (first, second) {
    return second[1] - first[1];
  });//sort
  balances = {};
  items.forEach(item => {//copy to dictionary
    balances[item[0]] = item[1];
  });
  return balances;
}
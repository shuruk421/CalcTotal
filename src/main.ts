
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

export async function GetRandomFromList(list: any, amount: any) {
  // Shuffle array
  const shuffled = list.sort(() => 0.5 - Math.random());
  // Get sub-array of first n elements after shuffled
  let selected = shuffled.slice(0, amount);
  return selected;
}

export async function RandomizeOneUps(balances: any, amount: any, min: any, max: any, newStaking: any) {
  let possibleTakers: any[] = [];
  for (let key in balances) {
    let value = balances[key];
    if (value >= min && value <= max) { // add decimals and check min and max
      possibleTakers.push(key);
    }
  }
  let oneUps = await GetRandomFromList(possibleTakers, amount);
  oneUps.forEach((oneUp: any) => {
    balances[oneUp] = newStaking; //add decimals and update balances
  });
  return balances;
}

export async function RandomizeWinnings(balances: any, tiers: any, totalWin: number) {
  var addrs: { [address: string]: Addr; } = {}; //create addr dictionary by address
  for (let key in balances) {
    let value = balances[key];
    addrs[key] = { addr: key, total: value, winnings: [] };
  }
  let promises: any = [];
  tiers.forEach((tier: any, index: number) => {
    let possibleTakers: any[] = [];
    for (let key in balances) {
      let value = balances[key];
      if (value >= +tier.minPoolz * Math.pow(10, decimals)) { // add decimals and check min poolz
        possibleTakers.push(key);
      }
      addrs[key].winnings.push({ name: tier.name, winAmount: 0 });
    }
    promises.push(GetRandomFromList(possibleTakers, +tier.numOfWinners).then((selected: any) => {
      let winAmount = +totalWin * +tier.allocation / 100 / tier.numOfWinners; // split between holders
      selected.forEach((winner: any) => {
        addrs[winner].winnings[index] = { name: tier.name, winAmount: winAmount }; //append to array
      });
    }));
  });
  await Promise.all(promises);
  let result = Object.values(addrs); // no need to return keys
  return result;
}

export async function SumWinnings(winnings: any) {
  let total = 0;
  winnings.forEach((winning: any) => {
    total += winning.winAmount;
  });
  return total;
}

export async function toCSV(data: any, tiers: any) {
  let csv = '"Address","Total",';
  tiers.forEach((tier: any) => {
    csv += '"' + tier.name + '",';
  })
  csv += '"Total Winnings",';
  for (let i = 0; i < data.length; i++) {
    csv += '\n"' + data[i].addr + '",' + '"' + data[i].total + '",';
    tiers.forEach((tier: any, index: any) => {
      csv += '"' + data[i].winnings[index].winAmount + '",';
    })
    await SumWinnings(data[i].winnings).then(total => {
      csv += '"' + total + '",';
    });
  };
  return csv;
}

export async function calcTotal(getLP: any, getStaking: any, getWallet: any) {
  var balances: { [address: string]: number; } = {};

  if (getLP) {
    balances = await LP.GetLP(balances);
  }

  if (getStaking) {
    balances = await Staking.GetStaking(balances);
  }

  if (getWallet) {
    balances = await Wallet.GetWallet(balances, tokenStartBlock); // token first block
  }
  balances = await CleanBalances(balances);
  return balances;
}

export async function SortDictionary(dictionary: any) {
  var items = Object.keys(dictionary).map(function (key) {
    return [key, dictionary[key]];
  });
  items.sort(function (first, second) {
    return second[1] - first[1];
  });//sort
  dictionary = {};
  items.forEach(item => {//copy to dictionary
    dictionary[item[0]] = item[1];
  });
  return dictionary;
}

export async function RemoveZeros(dictionary: any) {
  let promises = [];
  for (let key in dictionary) {
    let value = dictionary[key];
    if (key == '0x0000000000000000000000000000000000000000') // remove zero address (not contract)
      delete dictionary[key];
    else if (value == 0) // clean 0s
      delete dictionary[key];
    else
      promises.push(web3.eth.getCode(key).then(code => {
        if (code != '0x') // if contract
          delete dictionary[key];
      }));
  }
  await Promise.all(promises);
  return dictionary;
}

export async function CleanBalances(balances: any) {
  balances = await RemoveZeros(balances);
  return balances;
}

export async function WholeProccess(getLP: any, getStaking: any, getWallet: any, newStakingAmount: any, newStakingMin: any, newStakingMax: any, newStaking: any, tiers: any, totalWin: any) {
  let balances = await calcTotal(getLP, getStaking, getWallet);
  balances = await RandomizeOneUps(balances,
    newStakingAmount,
    newStakingMin * Math.pow(10, decimals),
    newStakingMax * Math.pow(10, decimals),
    newStaking * Math.pow(10, decimals));
  balances = await SortDictionary(balances);
  let data = await RandomizeWinnings(balances, tiers, totalWin)
  return await toCSV(data, tiers);
}
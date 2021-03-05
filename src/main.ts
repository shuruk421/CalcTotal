
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
  min *= Math.pow(10, decimals);
  max *= Math.pow(10, decimals);
  for (let key in balances) {
    let value = balances[key];
    if (value >= min && value <= max) { // add decimals and check min and max
      possibleTakers.push(key);
    }
  }
  let oneUps = await GetRandomFromList(possibleTakers, amount);
  oneUps.forEach((oneUp: any) => {
    balances[oneUp] = newStaking * Math.pow(10, decimals); //add decimals and update balances
  });
  return balances;
}

export async function RandomizeWinnings(balances: any, tiers: any, totalWin: number) {
  let tempTierUp = ["0x6361C82a61c3e519e9b51B3A823d2bCe31FE1DD1", "0x16Ec346eA64c6259B9cF581fa87324e3772250d7", "0xa379512A79b5A4474Da1Db8e8C4dd5E76D3F8353", "0x5b54f5BcD3FFD46E55f3E72f7866907bC4e2bf23", "0xff8F6f4acCC8FE7Db1940F9799e4e7ca4f476616", "0x671cB7Eff7b06092b8DD1Fa1D2b90aD7C9999999", "0xF77dC4B985E0605883C11eBBF03c4Fc8964034F1", "0xAD000B7D6344458e3c821A029bF6cB997835FA13", "0xe5E664766B4FE6Ca5a08970210ffcf4435A0Fc7A", "0xd2F8e16A494dD3Fb16ddc04eD066678A501DbBcc", "0x687E649D66cE942ddF0CD3ab21ccde727b201238", "0x46D0580FafE24Cd8EBa76d4FC3443058b09a86CA", "0xEb44a6D0e2a31b5f091c4fF933834E74313713e6", "0x52C1a0faC519F6C42204467A80f4EA2FC44A09FD", "0x7E700aAfe5E9082EfCC77C07D4bC781c0a806d71", "0x95220549543e671622DC6eDAaf08093A9c62dccD", "0x105608f252C1e3240de8fA87faf6AF5412676CE2", "0x849274c20E70a10e5C35fe93005Af5369a39199D", "0x6F90C476E6fEe4E65608fd1E93d6b9dF15F83B36", "0x2d1bdC590Cb736097Bc5577c8974e28dc48F5ECc", "0xCDa1D7c9b875157555e58d71923BBD077B06426B", "0xeFA551D2163576FAB707Fdf636339b1945d48FC6", "0xd7C89ceD6F23460B922F257aE509dc32b19edbba", "0x98E36C628Bfc856D42E5F7D8eF527B459f4C598f", "0x48226BBB3E18a029930b91324A841583eaD99176", "0x87C9B85EEaB9F698c088049DF1A185a232BEebc9", "0x0d8C9068fdb707Da13C308F3e8DCE2228b6d3f18", "0xfCd51496bF1a9192646d1B4b362DbE96Ab1fcC02", "0xC52413d58B1525caAF8A695b1eFa620Dd76D5DFB", "0xB9aE5EFeA0d548e29A9afd8e32f31a440d9E8588", "0x42c5D633ac3486115db8F5a23f7DBd4B0d259cc4", "0x8Bef454eCc3E0a7323F38ACd2483dF3aEc302BE9", "0x0d529fC86a751398bDad8824b9CC5471f4A18f21", "0x1Ec113303BAE3b0bb2f9eA68C866A9B1F9fA53A7", "0x006e3608A2865E4A0E4DCcFF533e3E536240C66A", "0x7b359142Aa64654932b3fe21Bf26caa57b72e2f8", "0xb94996A5Af163cC448995E79E642Ca3E36Ae6ac9", "0x190523F9a74F37b6210D779c204B351A19A2B642", "0xf1A19c82265967C72Ef4858DDF9A6146349C0193", "0xf4B4ebF5A4330505af540D130c2D88818a7c3Cd3", "0xD7cfe9acE49AC37F8da4F99603AAE19Ce70bEfb6", "0x2E52fBC6f734dFF8965771318265bA25612fD1bb", "0x74eC156d2c46C1883F57b25870068eab1a50Eab1", "0x3BE7eddb59F23ADeC733a8981f4d8A44e430bf90", "0xaF78408c820F138387a3b56612B041342686dA0E", "0xAfcb5BeAaEFa30E5167dFc070E8960d673320DAf", "0x2a76E27066D40dEDF94C6f1A05be450B5c81DB0E", "0xb215636E609F6D8c0184045C4BBC1eB535300f7c", "0x6ea1B7AAa93961b1ad1FA246fa8e79145ea7a680", "0x3673090e6B50Cf54312F735c16d55D64Db4388Fa", "0x2dEBA17a2D0E741BB68EDde016f8F35646AAB724", "0x4260984360d234C7DCeAb2328399F26cC597ea5A", "0xC11e8Af9F92Dc108ec4E7fDf1235f03ff41635e8", "0xA31DBF0435aF02F3B68eC7f985c9388E8AB1e47B", "0xaB984dc002dF11cC08d45622e2A522437fC8993C", "0x8Bb60857eF7b2FCA183D4bb2c1388d7D645496AE", "0x825701B149fB22105CD470E4a1ba0fa77c94Ff81"];
  tempTierUp.forEach((element, index) => {
    tempTierUp[index] = element.toLowerCase();
  });

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
        if (tempTierUp.includes(key) && index < 4) {//all if is temp
          balances[key] = +tiers[index + 1].minPoolz * Math.pow(10, decimals);
          let i = tempTierUp.indexOf(key, 0);
          if (i > -1) {
            tempTierUp.splice(index, 1);
          }
        }
        else
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
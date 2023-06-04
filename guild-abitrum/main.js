import {toChecksumAddress} from 'ethereum-checksum-address';

import axios from 'axios';
import Web3 from 'web3'
import fs from 'fs'
import abi from './abis/ABI.json' assert {type: "json"};
import dblABI from './abis/dblABI.json' assert {type: "json"};
import lptABI from './abis/lptABI.json' assert {type: "json"};
import approve_1ABI from './abis/approve_1ABI.json' assert {type: "json"};
import approve_1ErrorABI from './abis/approve_1ErrorABI.json' assert {type: "json"};
import approve_2ABI from './abis/approve_2ABI.json' assert {type: "json"};
import add_liquidityABI from './abis/add_liquidityABI.json' assert {type: "json"};
import swapABI from './abis/swapABI.json' assert {type: "json"};

import swaps from './swaps.json' assert {type: "json"}
import swaps_1inch from './swaps_1inch.json' assert {type: "json"}
import swaps_1inch_sell from './swaps_1inch_sell.json' assert {type: "json"}

const RPC = 'https://arb1.arbitrum.io/rpc';
const web3 = new Web3(new Web3.providers.HttpProvider(RPC));

const gasLimit = 400000;


const get_api_call_data = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);

    return get_api_call_data(url);
  }
};

async function timeout(time) {
  return await new Promise((res) => {
    setTimeout(() => {
      res()
    }, time);
  })
}

function intToDecimal(qty, decimal) {
  return parseInt(qty * parseInt("".concat("1", "0".repeat(decimal))));
}

const inchSwapSell = async (privatekey, amount_to_swap, fromTokenAddress, to_symbol) => {
  try {
    let ABI, need;
    if (to_symbol === "DBL") {
      ABI = dblABI;
      need = Math.round(Math.random() * (0.02 - 0.015) + 0.015, 6);
    }
    if (to_symbol === "LPT") {
      ABI = lptABI;
      need = 0.0012;
      need = Math.round(Math.random() * (0.002 - 0.0015) + 0.0015, 6);
    }

    const to_token_address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH

    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;

    const token = new web3.eth.Contract(ABI, fromTokenAddress); // declaring the token contract
    const token_balance = await token.methods.balanceOf(address_wallet).call();

    const need_amount = intToDecimal(need, 18);
    const amount = token_balance - need_amount;

    await inch_swap_approve(privatekey, amount, fromTokenAddress, to_symbol);
    await timeout(Math.floor(Math.random() * (10 - 4 + 1) + 4) * 1000);

    const _1inchurl = `https://api.1inch.io/v4.0/42161/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${to_token_address}&amount=${amount}&fromAddress=${address_wallet}&slippage=3`;
    const json_data = await get_api_call_data(_1inchurl);

    const nonce = await web3.eth.getTransactionCount(address_wallet);
    const tx = json_data.tx;
    tx.nonce = nonce;
    tx.to = web3.utils.toChecksumAddress(tx.to);
    tx.gasPrice = parseInt(tx.gasPrice);
    tx.value = parseInt(tx.value);
    const signed_tx = await web3.eth.accounts.signTransaction(tx, privatekey);
    const tx_hash = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);

    console.log(`\n>>> swap ${to_symbol} : https://arbiscan.io/tx/${tx_hash}`);
  } catch (error) {
    console.error(`\n>>> ${address_wallet} | ${to_symbol} | ${error}`);
  }
};

function inchSwap(privatekey, amount_to_swap, to_token_address, to_symbol) {
  try {


    function decimalToInt(price, decimal) {
      return price / parseInt("".concat("1", "0".repeat(decimal)));
    }


    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const fromTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH
    const amount = intToDecimal(amount_to_swap, 18);

    const _1inchurl = `https://api.1inch.io/v4.0/42161/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${to_token_address}&amount=${amount}&fromAddress=${address_wallet}&slippage=1`;

    get_api_call_data(_1inchurl).then(json_data => {
      const nonce = web3.eth.getTransactionCount(address_wallet);
      const tx = json_data.tx;
      tx.nonce = nonce;
      tx.to = web3.utils.toChecksumAddress(tx.to);
      tx.gasPrice = parseInt(tx.gasPrice);
      tx.value = parseInt(tx.value);
      const signed_tx = account.signTransaction(tx);
      web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
        .on('transactionHash', function (hash) {
          console.log(`\n>>> swap ${to_symbol} : https://arbiscan.io/tx/${hash}`);
        })
        .on('error', function (error) {
          console.error(`\n>>> ${address_wallet} | ${to_symbol} | ${error}`);
        });
    }).catch(error => {
      console.error(`\n>>> ${address_wallet} | ${to_symbol} | ${error}`);
    });

  } catch (error) {
    console.error(`\n>>> ${address_wallet} | ${to_symbol} | ${error}`);
  }
}

// async function webSushiGuild(privatekey, amount, to_token_address, to_symbol) {
//   try {
//     const account = web3.eth.accounts.privateKeyToAccount(privatekey);
//     const address_wallet = account.address;
//     const contractToken = toChecksumAddress('0x1b02da8cb0d097eb8d57a175b88c7d8b47997506');
//     const sushiRouter = new web3.eth.Contract(abi, contractToken);
//     const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
//
//     console.log(amount);
//     // Add liquidity with ETH
//     const amountEth = web3.utils.toWei(String(amount), 'ether');
//     const amountTokenDesired = 0;
//     const amountTokenMin = 0;
//     const amountEthMin = 0;
//     const path = [toChecksumAddress(to_token_address), contractToken];
//     const to = address_wallet;
//
//     console.log('addLiquidityETH ');
//     const tx = await sushiRouter.methods
//       .addLiquidityETH(
//         toChecksumAddress(to_token_address),
//         amountTokenDesired,
//         amountTokenMin,
//         amountEthMin,
//         address_wallet,
//         deadline,
//       )
//       .send({from: address_wallet, value: amountEth});
//     console.log(`Transaction hash: ${tx.transactionHash}`);
//
//     // Get the output token amount
//     const amountsOut = await sushiRouter.methods.getAmountsOut(amountEth, path).call();
//     const outputAmount = amountsOut[1];
//     console.log(`Output amount of ${to_symbol}: ${outputAmount}`);
//
//     return outputAmount;
//   } catch (error) {
//     console.error(error);
//   }
// }



async function approve_1(privatekey, gasLimit) {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const contractToken = web3.utils.toChecksumAddress('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8');
    const ABI = approve_1ABI;
    const contract = new web3.eth.Contract(ABI, contractToken);
    const spend = web3.utils.toChecksumAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'); // WETH

    function intToDecimal(qty, decimal) {
      return parseInt(qty * parseInt("".concat("1", "0".repeat(decimal))));
    }

    const gasPrice = intToDecimal(0.0000000001, 18);
    const nonce = await web3.eth.getTransactionCount(address_wallet);

    const contractData = contract.methods.approve(
      '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261',
      115792089237316195423570985008687907853269984665640564039457584007913129639935
    ).encodeABI();

    const txObject = {
      from: address_wallet,
      to: contractToken,
      data: contractData,
      value: '0x0',
      gas: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privatekey);
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`\n>>> HOP approve | https://arbiscan.io/tx/${tx.transactionHash}`, 'green');
  } catch (error) {

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privatekey);
      const addressWallet = account.address;
      const contractToken = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
      const ABI = approve_1ErrorABI;
      const contract = new web3.eth.Contract(ABI, contractToken);
      const spend = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // WETH

      const gasPrice = intToDecimal(0.0000000001, 18);
      const nonce = web3.eth.getTransactionCount(addressWallet);

      const contractTxn = contract.methods.approve(
        '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261',
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      ).encodeABI();

      const txParams = {
        from: addressWallet,
        to: contractToken,
        value: 0,
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: nonce,
        data: contractTxn
      };

      const signedTx = await web3.eth.accounts.signTransaction(txParams, privateKey);
      const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log(`\n>>> HOP approve | https://arbiscan.io/tx/${tx.transactionHash}`);
    } catch (error) {
      console.error(`\n>>> HOP approve | ${error}`);
    }

  }
}

async function swap(privatekey) {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const contractToken = '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261';
    const ABI = swapABI;
    const contract = new web3.eth.Contract(ABI, contractToken);
    const spend = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // WETH


    const gasPrice = intToDecimal(0.0000000001, 18);
    const nonce = await web3.eth.getTransactionCount(address_wallet);
    const amount = Math.floor(Math.random() * (11000 - 10300) + 10300);

    const contract_txn = contract.methods.swap(
      0,
      1,
      amount,
      0, // minDy
      (Math.floor(Date.now() / 1000) + 10000) // deadline
    ).encodeABI();

    const gasLimit = 1000000;

    const txObject = {
      'from': address_wallet,
      'to': contractToken,
      'data': contract_txn,
      'gas': gasLimit,
      'gasPrice': gasPrice,
      'nonce': nonce
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privatekey);
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`\n>>> HOP swap | https://arbiscan.io/tx/${tx.transactionHash}`);
  } catch (error) {
    console.log(`\n>>> HOP swap | ${error}`);
  }
}

async function approve_2() {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const contractToken = web3.utils.toChecksumAddress('0x0ce6c85cf43553de10fc56ceca0aef6ff0dd444d');
    const ABI = approve_2ABI;
    const contract = new web3.eth.Contract(ABI, contractToken);
    const spend = web3.utils.toChecksumAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'); // WETH

    function intToDecimal(qty, decimal) {
      return parseInt(qty * parseInt("".concat("1", "0".repeat(decimal))));
    }

    const gasPrice = intToDecimal(0.0000000001, 18);
    const nonce = await web3.eth.getTransactionCount(address_wallet);

    const contractTx = contract.methods.approve(
      '0x10541b07d8Ad2647Dc6cD67abd4c03575dade261',
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    ).encodeABI();

    const txObject = {
      from: address_wallet,
      to: contractToken,
      value: '0x0',
      gas: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
      data: contractTx
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privatekey);
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`>>> HOP approve | https://arbiscan.io/tx/${tx.transactionHash}`);
  } catch (error) {
    console.error(`>>> HOP approve | ${error}`);
  }
}

async function add_liquidity() {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const contractToken = web3.utils.toChecksumAddress('0x10541b07d8Ad2647Dc6cD67abd4c03575dade261');
    const ABI = add_liquidityABI;
    const contract = new web3.eth.Contract(ABI, contractToken);
    const spend = web3.utils.toChecksumAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'); // WETH

    function intToDecimal(qty, decimal) {
      return parseInt(qty * parseInt("".concat("1", "0".repeat(decimal))));
    }

    const gasPrice = intToDecimal(0.0000000001, 18);
    const nonce = await web3.eth.getTransactionCount(address_wallet);

    const amounts = [10000, 10000];
    const minToMint = 0;
    const deadline = parseInt((new Date().getTime() / 1000) + 10000);

    const contract_txn = contract.methods.addLiquidity(
      amounts,
      minToMint,
      deadline
    ).encodeABI();

    const gasLimit = await contract.methods.addLiquidity(amounts, minToMint, deadline).estimateGas({from: address_wallet});

    const rawTx = {
      from: address_wallet,
      to: contractToken,
      value: 0,
      gas: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
      data: contract_txn
    };

    const signedTx = await web3.eth.accounts.signTransaction(rawTx, privatekey);
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`\n>>> HOP add_liquidity | https://arbiscan.io/tx/${tx.transactionHash}`);
  } catch (error) {
    console.log(`\n>>> HOP add_liquidity | ${error}`);
  }
}

async function webHop() {

  await timeout(Math.floor(Math.random() * 7 + 4) * 1000)
  await approve_1()
  await timeout(Math.floor(Math.random() * 7 + 4) * 1000)
  await swap()
  await timeout(Math.floor(Math.random() * 7 + 4) * 1000)
  await approve_2()
  await timeout(Math.floor(Math.random() * 7 + 4) * 1000)
  await add_liquidity()

}

function randomFloatFromRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(8);
}

async function webSushiGuild(privatekey, amount, to_token_address, to_symbol) {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    const address_wallet = account.address;
    const contractToken = toChecksumAddress('0x1b02da8cb0d097eb8d57a175b88c7d8b47997506');
    const contract = new web3.eth.Contract(abi, contractToken);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    console.log(amount);
    // Swap ETH for the output token
    const amountOutMin = 0;
    const path = [web3.utils.toChecksumAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'), toChecksumAddress(to_token_address)];
    const to = address_wallet;
    const gasPrice = intToDecimal(0.0000000001, 18)
    const nonce = await web3.eth.getTransactionCount(address_wallet)
    const spend = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';


    const txData = contract.methods
      .swapExactETHForTokens(
        0, // amountOutMin
        [spend, to_token_address],
        address_wallet, // receiver
        parseInt(Date.now() / 1000) + 10000 // deadline
      )
      .encodeABI();

    const txObject = {
      from: address_wallet,
      to: contractToken,
      value: web3.utils.toWei(amount, 'ether'),
      gas: 8500000,
      gasPrice: gasPrice,
      nonce: nonce,
      data: txData
    };

    console.log(txObject);

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privatekey);
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      // .send({ from: address_wallet, value: web3.utils.toWei(String(amount), 'ether') });
    console.log(`Transaction hash: ${tx.transactionHash}`);

    // Get the output token amount
    const amountsOut = await sushiRouter.methods.getAmountsOut(web3.utils.toWei(String(amount), 'ether'), path).call();
    const outputAmount = amountsOut[1];
    console.log(`Output amount of ${to_symbol}: ${outputAmount}`);

    return outputAmount;
  } catch (error) {
    console.error(error);
  }
}

const main = async () => {
  console.log('\n============================================= hodlmod.eth =============================================', 'cyan')

  console.log('\nsubscribe to us : https://t.me/plushkin_blog', 'magenta')

  const privateKeys = fs.readFileSync('guild-abitrum/private_keys.txt', 'utf-8').split('\n').map(key => key.trim()).filter(key => key !== '')

  privateKeys.sort(() => Math.random() - 0.5)

  for (const privateKey of privateKeys) {
    swaps.sort(() => Math.random() - 0.5)
    swaps_1inch.sort(() => Math.random() - 0.5)
    swaps_1inch_sell.sort(() => Math.random() - 0.5)

    console.log(`\n=============== start : ${privateKey} ===============`, 'white')

    const account = web3.eth.accounts.privateKeyToAccount(privateKey)
    const addressWallet = account.address

    const txCost = []

    for (const swap of swaps) {
      const amountToSwap = randomFloatFromRange(swap.min, swap.max)
      const toTokenAddress = swap.address
      const toSymbol = swap.symbol
      txCost.push(amountToSwap)
      await webSushiGuild(privateKey, amountToSwap, toTokenAddress, toSymbol)
      await timeout(Math.floor(Math.random() * 240000) + 60000);
    }
    //
    for (const swap of swaps_1inch) {
      const amountToSwap = randomFloatFromRange(swap.min, swap.max)
      const toTokenAddress = swap.address
      const toSymbol = swap.symbol
      txCost.push(amountToSwap)
      await inchSwap(privateKey, amountToSwap, toTokenAddress, toSymbol)
      await timeout(Math.floor(Math.random() * 240000) + 60000);
    }
    //
    // await webHop(privateKey)
    // await timeout(Math.floor(Math.random() * 240000) + 60000);
    //
    // for (const swap of swaps_1inch_sell) {
    //   const amountToSwap = randomFloatFromRange(swap.min, swap.max)
    //   const toTokenAddress = swap.address
    //   const toSymbol = swap.symbol
    //   txCost.push(amountToSwap)
    //   await inchSwapSell(privateKey, amountToSwap, toTokenAddress, toSymbol)
    //   await timeout(Math.floor(Math.random() * 240000) + 60000);
    // }

    console.log(`\n=============== start sleep ===============`, 'white')
    await timeout(Math.floor(Math.random() * 240000) + 60000);
  }
}


main().catch(console.error);

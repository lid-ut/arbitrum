import {ethData} from "./ethWalletData.js";
import {toChecksumAddress} from "ethereum-checksum-address";
import abi from "./guild-abitrum/abis/ABI.json" assert {type: 'json'};
import Web3 from "web3";


const RPC = 'https://arb1.arbitrum.io/rpc';
const web3 = new Web3(new Web3.providers.HttpProvider(RPC));


function randomFloatFromRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(8);
}

function intToDecimal(qty, decimal) {
  return parseInt(qty * parseInt("".concat("1", "0".repeat(decimal))));
}

async function main() {


  const privatekey = ethData.etherPrivate;
  const amount = randomFloatFromRange(0.00110, 0.00115)
  const to_token_address = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
  const to_symbol = "USDC";


  const account = web3.eth.accounts.privateKeyToAccount(privatekey);
  const address_wallet = account.address;
  const contractToken = toChecksumAddress('0x1b02da8cb0d097eb8d57a175b88c7d8b47997506');
  const contract = new web3.eth.Contract(abi, contractToken);


  // Swap ETH for the output token
  const path = [web3.utils.toChecksumAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'), toChecksumAddress(to_token_address)];
  const gasPrice = intToDecimal(0.0000000001, 18)
  const nonce = await web3.eth.getTransactionCount(address_wallet)
  const spend = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';


  const txObjectEstimate = {
    from: address_wallet,
    to: address_wallet,
    value: web3.utils.toWei(amount, 'ether'),
  };

  const estimatedGas = await web3.eth.estimateGas(txObjectEstimate);
  console.log(estimatedGas);


  const txData = contract.methods
    .swapExactETHForTokens(
      0, // amountOutMin
      [spend, to_token_address],
      address_wallet, // receiver
      parseInt(Date.now() / 1000) + 10000 // deadline
    )
    .encodeABI();


  const txObjectSend = {
    from: address_wallet,
    to: contractToken,
    value: web3.utils.toWei(amount, 'ether'),
    gas: 8500000,
    gasPrice: gasPrice,
    nonce: nonce,
    data: txData
  };
  console.log(txObjectSend);

  const signedTx = await web3.eth.accounts.signTransaction(txObjectSend, privatekey);
  const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log(tx);
  console.log(`Transaction hash: ${tx.transactionHash}`);

  // Get the output token amount
  const amountsOut = await contract.methods.getAmountsOut(web3.utils.toWei(String(amount), 'ether'), path).call();
  const outputAmount = amountsOut[1];
  console.log(`Output amount of ${to_symbol}: ${outputAmount}`);
}

main()

import {getL2Network, EthBridger} from '@arbitrum/sdk';
import {providers, utils, Wallet, } from 'ethers';
import {ethData} from './ethWalletData.js'

function randomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(9);
}

const main = async () => {


  const l2Network = await getL2Network(42170);

  const ethBridger = new EthBridger(l2Network);

  const provider = new providers.InfuraProvider('mainnet', '9119a81222b94754bc097b833dc1eb78');

  const amount = utils.parseEther('0.006'); // Amount of ether to deposit
  const wallet = new Wallet(ethData.etherPrivate, provider); // Connected Ethereum mainnet wallet

  const arbitrumRpcUrl = 'https://nova.arbitrum.io/rpc';

  const l2Provider = new providers.JsonRpcProvider(arbitrumRpcUrl); // Connected Arbitrum Layer 2 provider

  const ethDepositTxResponse = await ethBridger.deposit({
    amount: amount,
    l1Signer: wallet,
    l2Provider: l2Provider,
  });

  const ethDepositTxReceipt = await ethDepositTxResponse.wait();

  console.log(ethDepositTxReceipt);
}
main();

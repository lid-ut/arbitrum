import Web3 from 'web3';
import starkwareCrypto from '@authereum/starkware-crypto';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletConnectStarkwareProvider from '@walletconnect/starkware-provider';
import fs from 'fs';
import ethers from 'ethers';
import {ethData} from "./ethWalletData.js";

// Set up web3 provider
const web3ProviderUrl = 'https://mainnet.infura.io/v3/9119a81222b94754bc097b833dc1eb78';
const web3 = new Web3(new Web3.providers.HttpProvider(web3ProviderUrl));

// Set up WalletConnect provider
const walletConnectProvider = await WalletConnectProvider({
  infuraId: '9119a81222b94754bc097b833dc1eb78', // Replace with your Infura project ID
});

// Enable the provider's StarkNet capability
walletConnectProvider.wc.starkwareProvider = await WalletConnectStarkwareProvider({
  rpcUrl: 'https://api.starkex.co/rpc',
  chainId: 1, // mainnet
  walletConnector: walletConnectProvider.wc,
});

// Set up StarkNet provider and contract information
const starkNetProvider = walletConnectProvider.wc.starkwareProvider;
const starknetContractAddress = '0x9e1585d92d8bd8a8c13e44d16caea702785c6ee7';
const walletAbi = JSON.parse(fs.readFileSync('./abi/MyWallet.json').toString()).abi;

// Set up the StarkNet wallet
async function createStarkNetWallet() {
  // Connect to the Ethereum wallet
  await walletConnectProvider.enable();
  const address = ethData.etherAddress;
  const wallet = new ethers.Wallet(address, web3.currentProvider);

  const starkPublicKey = starkwareCrypto.getPublicKey(ethData.etherPrivate);
  const starkNetAddress = await starkNetProvider.getContractAddress(starkPublicKey);

  // Connect to the StarkNet wallet contract
  const walletContract = new ethers.Contract(
    starknetContractAddress,
    walletAbi,
    new ethers.providers.JsonRpcProvider()
  ).connect(new WalletConnectStarkwareProvider(starkNetProvider, starkPublicKey));

  // Deposit funds from Ethereum to the StarkNet wallet
  const etherBalance = await web3.eth.getBalance(wallet.address);
  await walletContract.deposit({ from: starkNetAddress, value: etherBalance });

  console.log(`StarkNet wallet created with address ${starkNetAddress}`);
}

createStarkNetWallet();

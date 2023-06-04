import ethers from 'ethers'
import zksync from 'zksync'
import {ethData} from "./ethWalletData.js";


// Connect to Ethereum network
const ethProvider = new ethers.providers.InfuraProvider('mainnet', '9119a81222b94754bc097b833dc1eb78');
const ethWallet = new ethers.Wallet(ethData.etherPrivate, ethProvider);

// Connect to zkSync network
const syncProvider = await zksync.getDefaultProvider('mainnet');
const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

console.log(syncWallet);
console.log(syncWallet.address());
// Create a new zkSync wallet
// const newSyncWallet = await syncWallet.createWallet();

console.log(ethWallet.getAddress());

// Fund the new wallet with Ethereum
const ethAmount = ethers.utils.parseEther('0.00001'); // Send 1 ETH
const deposit = await syncWallet.depositToSyncFromEthereum({
  depositTo: '0x2ECa88b4da8005A5B4B8D38ab44A22877F25F307',
  token: 'ETH',
  amount: ethAmount,
});
//
// Wait for the deposit to be confirmed
const receipt = await deposit.awaitReceipt();
console.log(receipt);
// Check the new wallet's balance
const syncBalance = await syncWallet.getBalance('ETH');
console.log(`New zkSync wallet balance: ${syncBalance.toString()}`);

import pkg from 'ethereumjs-wallet';
const {hdkey} = pkg;

import bip39 from 'bip39';
import {ethData} from './ethWalletData.js';

(async () => {
  const etherIndex = 1;
  const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(ethData.mnemonic));
  const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${etherIndex}`).getWallet();
  const etherAddress = wallet.getAddressString();

  const v3Wallet = await wallet.toV3('private')
  console.log(v3Wallet);
  console.log(etherAddress);
  console.log(wallet.getPrivateKeyString());
})()

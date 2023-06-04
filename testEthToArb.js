import {getL2Network, EthBridger, getL1Network} from '@arbitrum/sdk';
import {providers, utils, Wallet,} from 'ethers';
import {ethData} from './ethWalletData.js'

function randomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(9);
}

const main = async () => {


  const l2Network = await getL2Network(42161);

  const ethBridger = new EthBridger(l2Network);

  const provider = new providers.InfuraProvider('mainnet', '9119a81222b94754bc097b833dc1eb78');

  const amount = utils.parseEther('0.00001'); // Amount of ether to deposit
  const wallet = new Wallet(ethData.etherPrivate, provider); // Connected Ethereum mainnet wallet

  const arbitrumRpcUrl = 'https://arb1.arbitrum.io/rpc';

  const l2Provider = new providers.JsonRpcProvider({
    url: arbitrumRpcUrl,
    fetch: (url, req) => {
      if (req.method === 'eth_sendTransaction') {
        // Здесь мы добавляем головные данные (для синхронизации времени) к транзакции
        req.params[0].nonce = req.params[0].nonce || '0x' + (Math.floor(Date.now() / 1000) - 1609459200).toString(16) + '000000';
        return fetch('http://ily_fomin_mail_ru:0cb214684f@83.171.234.171:30039', { // замените 'your-proxy-url.com' на URL вашего прокси
          method: 'POST',
          body: JSON.stringify(req),
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => res.json());
      }
      return fetch(url, req).then((res) => res.json());
    },
  });

  const ethDepositTxResponse = await ethBridger.deposit({
    amount: amount,
    l1Signer: wallet,
    l2Provider: l2Provider,
  });

  const ethDepositTxReceipt = await ethDepositTxResponse.wait();

  console.log(ethDepositTxReceipt);
}
main();

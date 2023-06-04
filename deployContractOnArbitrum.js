import {ethers, providers} from 'ethers';
import {ethData} from "./ethWalletData.js";
// Создаем асинхронную функцию для деплоя контракта
const deployContract = async () => {
  // Создаем провайдер для подключения к Arbirtum
  const arbitrumRpcUrl = 'https://arb1.arbitrum.io/rpc';

  const l2Provider = new providers.JsonRpcProvider(arbitrumRpcUrl); // Connected Arbitrum Layer 2 provider

  // Определяем bytecode и ABI контракта
  const bytecode = '0x608060405234801561001057600080fd5b5061014c806100206000396000f3fe608060405260043610603f5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416636d4ce63c81146044575b600080fd5b348015604f57600080fd5b5060566057565b60408051918252519081900360200190f35b60008060009054906101000a900460ff1681565b60008183019050805080905060';

  const abi = [
    {
      "inputs": [],
      "name": "getMessage",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "setMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Создаем объект кошелька для подписи транзакции
  const privateKey = ethData.etherPrivate;
  const wallet = new ethers.Wallet(privateKey, l2Provider);

  // Создаем объект фабрики контракта
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  // Деплоим контракт
  const contract = await factory.deploy();

  console.log('Контракт развернут на адресе:', contract.address);
};

deployContract();

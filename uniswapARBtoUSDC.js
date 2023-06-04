import {ethers} from "ethers";

import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType} from '@uniswap/sdk';
import {JsonRpcProvider} from '@ethersproject/providers';
import {Wallet} from '@ethersproject/wallet';
import {ethData} from "./ethWalletData.js";



const ARBITRUM_ONE = 42161; // ARB token address
const ARB_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // ARB token address
const USDC_ADDRESS = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'; // USDC token address on Arbitrum
const ARB_AMOUNT = '0.001'; // Amount of ARB to swap for USDC

const INFURA_KEY = '9119a81222b94754bc097b833dc1eb78'; // Replace with your Infura key
const ARBITRUM_RPC_URL = 'https://arb1.arbitrum.io/rpc'; // Arbitrum RPC endpoint



// import { ChainId, Token, Fetcher } from '@uniswap/sdk'

const chainId = ChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // must be checksummed

// note that you may want/need to handle this async code differently,
// for example if top-level await is not an option
const DAI = await Fetcher.fetchTokenData(ARBITRUM_ONE, ARB_ADDRESS)

console.log(DAI);


async function swapArbForUsdc() {
  const provider = new JsonRpcProvider(ARBITRUM_RPC_URL);
  const wallet = new Wallet(ethData.etherPrivate, provider); // Replace with your private key


  console.log(ChainId.ARBITRUM_ONE);

  const usdc = await Fetcher.fetchTokenData(ChainId.MAINNET, USDC_ADDRESS, provider);
  const arb = await Fetcher.fetchTokenData(ARBITRUM_ONE, ARB_ADDRESS, provider);

  const pair = await Fetcher.fetchPairData(arb, usdc, provider);
  const route = new Route([pair], usdc);
  const trade = new Trade(route, new TokenAmount(arb, ARB_AMOUNT * 1e18), TradeType.EXACT_INPUT);

  const slippageTolerance = new TokenAmount(usdc, '1000'); // 1000 USDC maximum slippage tolerance
  const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes deadline

  const path = [arb.address, usdc.address];
  const to = wallet.address;
  const value = trade.inputAmount.raw.toString();

  const uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Uniswap V2 Router 02 address
  const uniswapV2Router02Abi = [
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  ];

  const uniswapV2Router02 = new ethers.Contract(uniswapV2Router02Address, uniswapV2Router02Abi, wallet);

  const gasPrice = await provider.getGasPrice();
  const gasLimit = 400000;

  const tx = await uniswapV2Router02.swapExactTokensForTokens(
    value,
    amountOutMin,
    path,
    to,
    deadline,
    {gasPrice, gasLimit}
  );

  console.log('Transaction hash:', tx.hash);
}

// swapArbForUsdc();

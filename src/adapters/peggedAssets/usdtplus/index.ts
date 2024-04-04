const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  bsc: {
    issued: ["0x5335E87930b410b8C5BB4D43c3360ACa15ec0C8C"],
  },
  linea: {
    issued: ["0x1E1F509963A6D33e169D9497b11c7DbFe73B7F13"],
  },
  arbitrum: {
    issued: ["0xb1084db8D3C05CEbd5FA9335dF95EE4b8a0edc30"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  },
  linea: {
    minted: chainMinted("linea", 6),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 6),
    unreleased: async () => ({}),
  },
};

export default adapter;

import { SafeEventEmitterProvider } from "@web3auth/base";
import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import { ApiPromise, WsProvider } from "@polkadot/api";
// import { WsProvider } from "@polkadot/rpc-provider";
import { options } from "@reef-defi/api";
import { stringToU8a, u8aToHex } from "@reef-defi/util";

export default class ReefRPC {
  private provider: SafeEventEmitterProvider;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  makeClient = async (): Promise<any> => {
    console.log("Establishing connection to Reef RPC...");
    const provider = new WsProvider("wss://rpc-testnet.reefscan.com/ws");
    const api = await ApiPromise.create({ provider });
    const resp = await api.isReady;
    console.log("Reef RPC is ready", resp);
    return api;
  };

  getReefKeyPair = async (): Promise<any> => {
    await cryptoWaitReady();
    const privateKey = (await this.provider.request({
      method: "private_key",
    })) as string;
    console.log("privateKey", "0x" + privateKey);
    const keyring = new Keyring({ ss58Format: 42, type: "sr25519" });

    const keyPair = keyring.addFromUri("0x" + privateKey);
    console.log("keyPair", keyPair);
    return keyPair;
  };

  getAccounts = async (): Promise<any> => {
    const keyPair = await this.getReefKeyPair();
    return keyPair.address;
  };

  getBalance = async (): Promise<any> => {
    const keyPair = await this.getReefKeyPair();
    const api = await this.makeClient();
    const data = await api.query.system.account(keyPair.address);
    console.log(data);
    return data.toHuman();
  };

  signAndSendTransaction = async (): Promise<any> => {
    const keyPair = await this.getReefKeyPair();
    const api = await this.makeClient();
    const txHash = await api.tx.balances
      .transfer("5Gzhnn1MsDUjMi7S4cN41CfggEVzSyM58LkTYPFJY3wt7o3d", 12345)
      .signAndSend(keyPair);
    console.log(txHash);
    return txHash.toHuman();
  };

  signMessage = async (): Promise<any> => {
    const keyPair = await this.getReefKeyPair();
    const message = stringToU8a("Hello from Web3Auth"); // message to sign
    console.log("message", u8aToHex(message));
    const signature = keyPair.sign(message);
    console.log("signature", u8aToHex(signature));
    return u8aToHex(signature);
  };
}

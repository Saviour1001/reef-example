import { SafeEventEmitterProvider } from "@web3auth/base";
import { Keyring } from "@polkadot/api";
import { setSS58Format } from "@polkadot/util-crypto";
const { cryptoWaitReady, signatureVerify } = require("@polkadot/util-crypto");
// const { Keyring } = require("@reef-defi/keyring");
import { stringToU8a } from "@polkadot/util";

export default class ReefRPC {
  private provider: SafeEventEmitterProvider;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  getReefKeyPair = async (): Promise<any> => {
    await cryptoWaitReady();
    const privateKey = (await this.provider.request({
      method: "private_key",
    })) as string;
    console.log("privateKey", privateKey.slice(0, 32));
    const keyring = new Keyring({ ss58Format: 42, type: "sr25519" });

    const keyPair = keyring.addFromUri(privateKey.slice(0, 32));
    console.log("keyPair", keyPair);
  };
}

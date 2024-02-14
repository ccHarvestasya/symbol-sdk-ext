import { BaseCatapult } from './BaseCatapult';
import { ChainInfo } from './model/ChainInfo';

// /**
//  * パケットタイプ
//  */
// enum PacketType {
//   CHAIN_STATISTICS = 5,
//   FINALIZATION_STATISTICS = 0x132,
//   NODE_DISCOVERY_PULL_PING = 0x111,
//   NODE_DISCOVERY_PULL_PEERS = 0x113,
//   UNLOCKED_ACCOUNTS = 0x304,
// }

export class ChainCat extends BaseCatapult {
  /**
   * ChainInfo取得
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(): Promise<ChainInfo | undefined> {
    let chainInfo: ChainInfo | undefined = new ChainInfo();
    try {
      // ピア問合せ
      const CHAIN_STATISTICS = 5;
      const FINALIZATION_STATISTICS = 0x132;
      const promises: Promise<Uint8Array | undefined>[] = [];
      promises.push(this.catapult(CHAIN_STATISTICS));
      promises.push(this.catapult(FINALIZATION_STATISTICS));
      const socketDatas = await Promise.all(promises);
      if (!socketDatas[0]) return undefined;
      if (!socketDatas[1]) return undefined;
      // 編集
      const chainBufferView = Buffer.from(socketDatas[0]);
      const finalBufferView = Buffer.from(socketDatas[1]);
      chainInfo.height = chainBufferView.readBigUint64LE(0).toString();
      chainInfo.scoreHigh = chainBufferView.readBigUint64LE(16).toString();
      chainInfo.scoreLow = chainBufferView.readBigUint64LE(24).toString();
      chainInfo.latestFinalizedBlock = {
        finalizationEpoch: finalBufferView.readUInt32LE(0),
        finalizationPoint: finalBufferView.readUInt32LE(4),
        height: finalBufferView.readBigUInt64LE(8).toString(),
        hash: finalBufferView.toString('hex', 16, 48).toUpperCase(),
      };
    } catch (e) {
      chainInfo = undefined;
    }
    return chainInfo;
  }
}

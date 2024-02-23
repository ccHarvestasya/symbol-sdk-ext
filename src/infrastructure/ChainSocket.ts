import { ChainInfo, FinalizedBlock } from '../model/blockchain';
import { PacketBuffer } from '../util';
import { Socket } from './Socket';

export class ChainSocket extends Socket {
  /**
   * ChainInfo取得
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(): Promise<ChainInfo | undefined> {
    let chainInfo: ChainInfo | undefined;
    try {
      // ピア問合せ
      const CHAIN_STATISTICS = 5;
      const FINALIZATION_STATISTICS = 0x132;
      const promises: Promise<Uint8Array | undefined>[] = [];
      promises.push(this.requestSocket(CHAIN_STATISTICS));
      promises.push(this.requestSocket(FINALIZATION_STATISTICS));
      const socketDatas = await Promise.all(promises);
      if (!socketDatas[0]) return undefined;
      if (!socketDatas[1]) return undefined;
      // 編集
      const chainBuffer = new PacketBuffer(Buffer.from(socketDatas[0]));
      const finalBuffer = new PacketBuffer(Buffer.from(socketDatas[1]));
      const height = chainBuffer.readBigUInt64LE().toString();
      const scoreHigh = chainBuffer.readBigUInt64LE(8).toString();
      const scoreLow = chainBuffer.readBigUInt64LE().toString();
      const finalizationEpoch = finalBuffer.readUInt32LE();
      const finalizationPoint = finalBuffer.readUInt32LE();
      const finalizationHeight = finalBuffer.readBigUInt64LE().toString();
      const finalizationHash = finalBuffer.readHexString(48).toUpperCase();

      const finalizedBlock = new FinalizedBlock(
        finalizationEpoch,
        finalizationPoint,
        finalizationHeight,
        finalizationHash
      );
      chainInfo = new ChainInfo(height, scoreHigh, scoreLow, finalizedBlock);
    } catch (e) {
      chainInfo = undefined;
    }
    return chainInfo;
  }
}

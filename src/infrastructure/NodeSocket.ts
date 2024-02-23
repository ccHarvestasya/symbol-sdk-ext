import { NodeRepository } from '.';
import { NodeInfo, NodePeer, NodeTime, NodeUnlockedAccount } from '../model/node';
import { PacketBuffer } from '../util';
import { Socket } from './Socket';

export class NodeSocket extends Socket implements NodeRepository {
  /**
   * NodeInfo取得
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async getNodeInfo(): Promise<NodeInfo | undefined> {
    let nodeInfo: NodeInfo | undefined = undefined;
    try {
      // ピア問合せ
      const NODE_DISCOVERY_PULL_PING = 0x111;
      const socketData = await this.requestSocket(NODE_DISCOVERY_PULL_PING);
      if (!socketData) return undefined;
      // 編集
      const nodeBufferView = new PacketBuffer(Buffer.from(socketData));
      const version = nodeBufferView.readUInt32LE(4);
      const publicKey = nodeBufferView.readHexString(32).toUpperCase();
      const networkGenerationHashSeed = nodeBufferView.readHexString(32).toUpperCase();
      const roles = nodeBufferView.readUInt32LE();
      const port = nodeBufferView.readUInt16LE();
      const networkIdentifier = nodeBufferView.readUInt8();
      const hostLength = nodeBufferView.readUInt8();
      const friendlyNameLength = nodeBufferView.readUInt8();
      const host = nodeBufferView.readString(hostLength);
      const friendlyName = nodeBufferView.readString(friendlyNameLength);
      // 証明書有効期限、ノード公開鍵取得
      const nodePublicKey = this._x509Certificate!.publicKey.export({ format: 'der', type: 'spki' })
        .toString('hex', 12, 44)
        .toUpperCase();
      const validTo = this._x509Certificate!.validTo;
      const validToDate = new Date(validTo);
      const certificateExpirationDate = validToDate;
      nodeInfo = new NodeInfo(
        version,
        publicKey,
        networkGenerationHashSeed,
        roles,
        port,
        networkIdentifier,
        host,
        friendlyName,
        nodePublicKey,
        certificateExpirationDate
      );
    } catch (e) {
      nodeInfo = undefined;
    }
    return nodeInfo;
  }

  /**
   * NodePeers取得
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  async getNodePeers(): Promise<NodePeer[] | undefined> {
    let nodePeers: NodePeer[] | undefined = [];
    try {
      // ピア問合せ
      const NODE_DISCOVERY_PULL_PEERS = 0x113;
      const socketData = await this.requestSocket(NODE_DISCOVERY_PULL_PEERS);
      if (!socketData) return undefined;
      const nodeBufferView = new PacketBuffer(Buffer.from(socketData));
      // 編集
      while (nodeBufferView.index < nodeBufferView.length) {
        const version = nodeBufferView.readUInt32LE(4);
        const publicKey = nodeBufferView.readHexString(32).toUpperCase();
        const networkGenerationHashSeed = nodeBufferView.readHexString(32).toUpperCase();
        const roles = nodeBufferView.readUInt32LE();
        const port = nodeBufferView.readUInt16LE();
        const networkIdentifier = nodeBufferView.readUInt8();
        const hostLength = nodeBufferView.readUInt8();
        const friendlyNameLength = nodeBufferView.readUInt8();
        const host = nodeBufferView.readString(hostLength);
        const friendlyName = nodeBufferView.readString(friendlyNameLength);

        const nodePeer = new NodePeer(
          version,
          publicKey,
          networkGenerationHashSeed,
          roles,
          port,
          networkIdentifier,
          host,
          friendlyName
        );
        nodePeers.push(nodePeer);
      }
    } catch (e) {
      nodePeers = undefined;
    }
    return nodePeers;
  }

  /**
   * NodeUnlockedAccount取得
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  async getNodeUnlockedAccount(): Promise<NodeUnlockedAccount | undefined> {
    let nodeUnlockedAccount: NodeUnlockedAccount | undefined = undefined;
    try {
      // ピア問合せ
      const UNLOCKED_ACCOUNTS = 0x304;
      const socketData = await this.requestSocket(UNLOCKED_ACCOUNTS);
      if (!socketData) return undefined;
      // 編集
      const nodeBufferView = new PacketBuffer(Buffer.from(socketData));
      const unlockedAccount: string[] = [];
      while (nodeBufferView.index < nodeBufferView.length) {
        unlockedAccount.push(nodeBufferView.readHexString(32).toUpperCase());
      }
      nodeUnlockedAccount = new NodeUnlockedAccount(unlockedAccount);
    } catch (e) {
      nodeUnlockedAccount = undefined;
    }
    return nodeUnlockedAccount;
  }

  /**
   * NodeTime取得
   * @returns 成功: NodeTime, 失敗: undefined
   */
  async getNodeTime(): Promise<NodeTime | undefined> {
    let nodeTime: NodeTime | undefined = undefined;
    try {
      // ピア問合せ
      const TIME_SYNC_NETWORK_TIME = 0x120;
      const socketData = await this.requestSocket(TIME_SYNC_NETWORK_TIME);
      if (!socketData) return undefined;
      // 編集
      const nodeBufferView = Buffer.from(socketData);
      nodeTime = new NodeTime({
        sendTimestamp: nodeBufferView.readBigUInt64LE(0).toString(),
        receiveTimestamp: nodeBufferView.readBigUInt64LE(8).toString(),
      });
    } catch (e) {
      nodeTime = undefined;
    }
    return nodeTime;
  }
}

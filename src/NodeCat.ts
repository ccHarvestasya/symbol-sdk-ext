import { BaseCatapult } from './BaseCatapult';
import { NodeInfo } from './model/NodeInfo';
import { NodePeer } from './model/NodePeer';
import { NodeTime } from './model/NodeTime';
import { NodeUnlockedAccount } from './model/NodeUnlockedAccount';

export class NodeCat extends BaseCatapult {
  /**
   * NodeInfo取得
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async getNodeInfo(): Promise<NodeInfo | undefined> {
    let nodeInfo: NodeInfo | undefined = undefined;
    try {
      // ピア問合せ
      const NODE_DISCOVERY_PULL_PING = 0x111;
      const socketData = await this.catapult(NODE_DISCOVERY_PULL_PING);
      if (!socketData) return undefined;
      // 編集
      nodeInfo = new NodeInfo();
      const nodeBufferView = Buffer.from(socketData);
      nodeInfo.version = nodeBufferView.readUInt32LE(4);
      nodeInfo.publicKey = nodeBufferView.toString('hex', 8, 40).toUpperCase();
      nodeInfo.networkGenerationHashSeed = nodeBufferView.toString('hex', 40, 72).toUpperCase();
      nodeInfo.roles = nodeBufferView.readUInt32LE(72);
      nodeInfo.port = nodeBufferView.readUInt16LE(76);
      nodeInfo.networkIdentifier = nodeBufferView.readUInt8(78);
      const hostLength = nodeBufferView.readUInt8(79);
      const friendlyNameLength = nodeBufferView.readUInt8(80);
      nodeInfo.host = nodeBufferView.toString('utf8', 81, 81 + hostLength);
      nodeInfo.friendlyName = nodeBufferView.toString(
        'utf8',
        81 + hostLength,
        81 + hostLength + friendlyNameLength
      );
      nodeInfo.isAvailable = true;
      // 証明書有効期限、ノード公開鍵取得
      if (this.x509Certificate) {
        const nodePublicKey = this.x509Certificate.publicKey
          .export({ format: 'der', type: 'spki' })
          .toString('hex', 12, 44)
          .toUpperCase();
        nodeInfo.nodePublicKey = nodePublicKey;
        const validTo = this.x509Certificate.validTo;
        const validToDate = new Date(validTo);
        nodeInfo.certificateExpirationDate = validToDate;
      }
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
      const socketData = await this.catapult(NODE_DISCOVERY_PULL_PEERS);
      if (!socketData) return undefined;
      const nodeBufferView = Buffer.from(socketData);
      // 編集
      let index = 0;
      while (index < nodeBufferView.length) {
        const nodePeer = new NodePeer();
        index += 4;
        nodePeer.version = nodeBufferView.readUInt32LE(index);
        index += 4;
        nodePeer.publicKey = nodeBufferView.toString('hex', index, index + 32).toUpperCase();
        index += 32;
        nodePeer.networkGenerationHashSeed = nodeBufferView
          .toString('hex', index, index + 32)
          .toUpperCase();
        index += 32;
        nodePeer.roles = nodeBufferView.readUInt32LE(index);
        index += 4;
        nodePeer.port = nodeBufferView.readUInt16LE(index);
        index += 2;
        nodePeer.networkIdentifier = nodeBufferView.readUInt8(index);
        index += 1;
        const hostLength = nodeBufferView.readUInt8(index);
        index += 1;
        const friendlyNameLength = nodeBufferView.readUInt8(index);
        index += 1;
        nodePeer.host = nodeBufferView.toString('utf8', index, index + hostLength);
        nodePeer.friendlyName = nodeBufferView.toString(
          'utf8',
          index + hostLength,
          index + hostLength + friendlyNameLength
        );
        index += hostLength + friendlyNameLength;
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
      const socketData = await this.catapult(UNLOCKED_ACCOUNTS);
      if (!socketData) return undefined;
      // 編集
      const nodeBufferView = Buffer.from(socketData);
      nodeUnlockedAccount = new NodeUnlockedAccount();
      let index = 0;
      while (index < nodeBufferView.length) {
        nodeUnlockedAccount.unlockedAccount.push(
          nodeBufferView.toString('hex', index, index + 32).toUpperCase()
        );
        index += 32;
      }
    } catch (e) {
      nodeUnlockedAccount = undefined;
    }
    return nodeUnlockedAccount;
  }

  async getNodeTime(): Promise<NodeTime | undefined> {
    let nodeTime: NodeTime | undefined = undefined;
    try {
      // ピア問合せ
      const TIME_SYNC_NETWORK_TIME = 0x120;
      const socketData = await this.catapult(TIME_SYNC_NETWORK_TIME);
      if (!socketData) return undefined;
      // 編集
      const nodeBufferView = Buffer.from(socketData);
      nodeTime = new NodeTime();
      nodeTime.communicationTimestamps = {
        sendTimestamp: nodeBufferView.readBigUInt64LE(0).toString(),
        receiveTimestamp: nodeBufferView.readBigUInt64LE(8).toString(),
      };
    } catch (e) {
      nodeTime = undefined;
    }
    return nodeTime;
  }
}

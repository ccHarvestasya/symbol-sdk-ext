import { NodeRepository } from '.';
import { NodeInfo, NodePeer, NodeTime, NodeUnlockedAccount } from '../model/node';
import { Http } from './Http';

export class NodeHttp extends Http implements NodeRepository {
  /**
   * NodeInfo取得
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async getNodeInfo(): Promise<NodeInfo | undefined> {
    const path = '/node/info';
    const nodeInfo = await this.requestRestGateway<NodeInfo>(path);
    if (nodeInfo) {
      nodeInfo.host = this.host; // たまに空の奴がいるので再セット
    }
    return nodeInfo;
  }

  /**
   * NodePeers取得
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  async getNodePeers(): Promise<NodePeer[] | undefined> {
    const path = '/node/peers';
    return await this.requestRestGateway<NodePeer[] | undefined>(path);
  }

  /**
   * NodeUnlockedAccount取得
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  async getNodeUnlockedAccount(): Promise<NodeUnlockedAccount | undefined> {
    const path = '/node/unlockedaccount';
    return await this.requestRestGateway<NodeUnlockedAccount>(path);
  }

  /**
   * NodeTime取得
   * @returns 成功: NodeTime, 失敗: undefined
   */
  async getNodeTime(): Promise<NodeTime | undefined> {
    const path = '/node/time';
    return await this.requestRestGateway<NodeTime>(path);
  }
}

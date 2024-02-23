import { NodeInfo, NodePeer, NodeTime, NodeUnlockedAccount } from '../model/node';

export interface NodeRepository {
  /**
   * NodeInfo取得
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  getNodeInfo(): Promise<NodeInfo | undefined>;

  /**
   * NodePeers取得
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  getNodePeers(): Promise<NodePeer[] | undefined>;

  /**
   * NodeUnlockedAccount取得
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  getNodeUnlockedAccount(): Promise<NodeUnlockedAccount | undefined>;

  /**
   * NodeTime取得
   * @returns 成功: NodeTime, 失敗: undefined
   */
  getNodeTime(): Promise<NodeTime | undefined>;
}

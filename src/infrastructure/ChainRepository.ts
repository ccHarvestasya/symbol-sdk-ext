import { ChainInfo } from '../model/blockchain';

/**
 * ChainRepositoryインターフェース
 */
export interface ChainRepository {
  /**
   * ChainInfo取得
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  getChainInfo(): Promise<ChainInfo | undefined>;
}

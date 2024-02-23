import { NetworkProperties } from '../model/network';

export interface NetworkRepository {
  /**
   * NetworkProperties取得
   * @param host ホスト名
   * @returns 成功: NetworkProperties, 失敗: undefined
   */
  getNetworkProperties(): Promise<NetworkProperties | undefined>;

  /**
   * NetworkProperties死活
   * @returns 成功: true, 失敗: false
   */
  isAvailableNetworkProperties(): Promise<boolean>;
}

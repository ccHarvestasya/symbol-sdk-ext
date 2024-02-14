import { BaseRestGateway } from './BaseRestGateway';
import { NetworkProperties } from './model/NetworkProperties';

export class NetworkHttp extends BaseRestGateway {
  /**
   * NetworkProperties取得
   * @param host ホスト名
   * @returns 成功: NetworkProperties, 失敗: undefined
   */
  async getNetworkProperties(): Promise<NetworkProperties | undefined> {
    const path = '/network/properties';
    return await this.requestRestGateway<NetworkProperties>(path);
  }

  /**
   * NetworkProperties死活
   * @returns 成功: true, 失敗: false
   */
  async isAvailableNetworkProperties(): Promise<boolean> {
    const networkProperties = await this.getNetworkProperties();
    return networkProperties !== undefined;
  }
}

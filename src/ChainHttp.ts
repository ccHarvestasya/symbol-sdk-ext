import { BaseRestGateway } from './BaseRestGateway';
import { ChainInfo } from './model/ChainInfo';

export class ChainHttp extends BaseRestGateway {
  /**
   * ChainInfo取得
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(): Promise<ChainInfo | undefined> {
    const path = '/chain/info';
    return await this.requestRestGateway<ChainInfo>(path);
  }
}

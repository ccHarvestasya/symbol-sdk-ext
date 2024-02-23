import { ChainInfo } from '../model/blockchain';
import { ChainRepository } from './ChainRepository';
import { Http } from './Http';

export class ChainHttp extends Http implements ChainRepository {
  /**
   * ChainInfo取得
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(): Promise<ChainInfo | undefined> {
    const path = '/chain/info';
    return await this.requestRestGateway<ChainInfo>(path);
  }
}

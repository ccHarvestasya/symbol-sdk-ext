import { AccountInfo } from '../model/account/AccountInfo';
import { AccountRepository } from './AccountRepository';
import { Http } from './Http';

export class AccountHttp extends Http implements AccountRepository {
  /**
   * AccountInfo取得
   * @param address アドレス
   * @returns 成功: AccountInfo, 失敗: undefined
   */
  async getAccountInfo(address: string): Promise<AccountInfo | undefined> {
    const path = `/accounts/${address}`;
    return await this.requestRestGateway<AccountInfo>(path);
  }
}

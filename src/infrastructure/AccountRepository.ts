import { AccountInfo } from '../model/account/AccountInfo';

/**
 * AccountRepositoryインターフェース
 */
export interface AccountRepository {
  /**
   * AccountInfo取得
   * @param address アドレス
   * @returns 成功: AccountInfo, 失敗: undefined
   */
  getAccountInfo(address: string): Promise<AccountInfo | undefined>;
}

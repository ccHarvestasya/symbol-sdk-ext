import axios, { AxiosResponse } from 'axios';
import * as TLS from 'tls';

export class SymbolSdkExt {
  /**
   * コンストラクタ
   * @param timeout タイムアウト
   */
  constructor(private readonly timeout: number = 3000) {}

  /**
   * HTTPs利用可能確認
   * @param host ホスト
   * @returns true: HTTPs有
   */
  isEnableHttps(host: string): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = TLS.connect(
        { host: host, port: 3001, timeout: this.timeout, servername: host },
        () => {
          resolve(true);
          socket.destroy();
        }
      );
      socket.on('timeout', () => {
        resolve(false);
        socket.destroy();
      });
      socket.on('error', () => {
        resolve(false);
        socket.destroy();
      });
    });
  }

  /**
   * トランザクション検索/ページ
   * @param host ホスト
   * @param isHttpsEnabled HTTPs利用(デフォルト: false)
   * @returns
   */
  async getTxSearchCountPerPage(host: string, isHttpsEnabled: boolean = false) {
    let baseUrl = '';
    if (isHttpsEnabled) {
      baseUrl = `https://${host}:3001`;
    } else {
      baseUrl = `http://${host}:3000`;
    }
    const path = '/transactions/confirmed?height=325040&pageSize=9999';
    try {
      const restGwAxios = axios.create({
        baseURL: baseUrl,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      const restGwResponseData = await restGwAxios.get(path).then((res: AxiosResponse) => {
        return res.data.pagination.pageSize;
      });
      return restGwResponseData;
    } catch (e) {
      return undefined;
    }
  }
}

import axios, { AxiosResponse } from 'axios';
import * as TLS from 'tls';

export class SymbolSdkExt {
  /**
   * コンストラクタ
   * @param timeout タイムアウト
   */
  constructor(private readonly timeout: number = 3000) {}

  /**
   * HTTPs有無
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
   * Restゲートウェイから値を取得する
   * @param baseUrl ベースURL
   * @param path パス
   * @returns Restゲートウェイ応答結果
   */
  private async requestRestGateway<T>(baseUrl: string, path: string): Promise<T> {
    try {
      const restGwAxios = axios.create({
        baseURL: baseUrl,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      const restGwResponseData = await restGwAxios.get(path).then((res: AxiosResponse<T>): T => {
        return res.data;
      });
      return restGwResponseData;
    } catch (e) {
      throw e;
    }
  }
}

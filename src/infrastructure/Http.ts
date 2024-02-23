import axios, { AxiosResponse } from 'axios';

export abstract class Http {
  /** ベースURL */
  private baseUrl: string;

  /**
   * コンストラクタ
   * @param host ホスト
   * @param isHttps HTTPs有無(デフォルト: true)
   * @param timeout タイムアウト(デフォルト: 3000)
   */
  constructor(
    protected readonly host: string,
    protected readonly isHttps: boolean = true,
    private readonly timeout: number = 3000
  ) {
    if (this.isHttps) {
      this.baseUrl = `https://${this.host}:3001`;
    } else {
      this.baseUrl = `http://${this.host}:3000`;
    }
  }

  /**
   * Restゲートウェイから値を取得する
   * @param path パス
   * @returns Restゲートウェイ応答結果
   */
  protected async requestRestGateway<T>(path: string): Promise<T | undefined> {
    try {
      const restGwAxios = axios.create({
        baseURL: this.baseUrl,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      const restGwResponseData = await restGwAxios.get(path).then((res: AxiosResponse<T>): T => {
        return res.data;
      });
      return restGwResponseData;
    } catch (e) {
      return undefined;
    }
  }
}

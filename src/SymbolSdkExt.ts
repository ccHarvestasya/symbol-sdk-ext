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
      try {
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
      } catch (e) {
        resolve(false);
      }
    });
  }
}

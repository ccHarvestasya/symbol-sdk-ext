import { X509Certificate } from 'crypto';
import fs from 'fs';
import tls, { ConnectionOptions } from 'tls';

enum PacketType {
  /** トランザクションアナウンス */
  PUSH_TRANSACTIONS = 0x009,
}

export abstract class Socket {
  private _connectionOptions: ConnectionOptions;

  protected _x509Certificate: X509Certificate | undefined;

  /**
   * コンストラクタ
   * @param _host ホスト
   * @param _port ポート(デフォルト: 7900)
   * @param _timeout タイムアウト(デフォルト: 3000)
   */
  constructor(
    protected readonly _host: string,
    protected readonly _port: number = 7900,
    private readonly _timeout: number = 3000
  ) {
    const currentDir = process.cwd().replace(/\\/g, '/');
    this._connectionOptions = {
      host: this._host,
      port: this._port,
      timeout: this._timeout,
      cert: fs.readFileSync(`${currentDir}/cert/node.full.crt.pem`),
      key: fs.readFileSync(`${currentDir}/cert/node.key.pem`),
      rejectUnauthorized: false,
    };
  }

  /**
   * トランザクションアナウンス
   * @param payload トランザクションペイロード
   */
  public async announceTransaction(payload: Uint8Array): Promise<void> {
    await this.requestSocket(PacketType.PUSH_TRANSACTIONS, payload, false);
  }

  /**
   * カタパルトサーバへパケットを送信する
   * @param packetType パケットタイプ
   * @param payload ペイロード
   * @param isResponse レスポンス有無(デフォルト: true)
   * @returns レスポンスデータ
   */
  protected async requestSocket(
    packetType: number,
    payload?: Uint8Array,
    isResponse: boolean = true
  ): Promise<Uint8Array | undefined> {
    return new Promise<Uint8Array | undefined>((resolve, reject) => {
      const payloadSize = payload ? payload.length : 0;
      let responseSize = 8; // ヘッダ分のサイズを前もって付与
      let responseData: Uint8Array | undefined = undefined;

      const socket = tls.connect(this._connectionOptions, () => {
        // Symbolパケット生成
        const headerSize = 8;
        const packetSize = headerSize + payloadSize;
        const symbolPacketBuffer = new ArrayBuffer(packetSize);
        // Symbolヘッダー編集
        const symbolHeader = new DataView(symbolPacketBuffer);
        symbolHeader.setUint32(0, packetSize, true);
        symbolHeader.setUint32(4, packetType, true);

        if (payload) {
          // Symbolペイロード編集
          const symbolPayload = new Uint8Array(symbolPacketBuffer, headerSize, payloadSize);
          symbolPayload.set(payload);
        }

        // Symbolパケット送信
        socket.write(new Uint8Array(symbolPacketBuffer));
        // console.debug(`packet type ${packetType} written`);

        if (!isResponse) {
          // ソケット切断
          socket.destroy();
        }
      });

      // SSL接続時
      socket.on('secureConnect', () => {
        const peerX509 = socket.getPeerX509Certificate();
        if (!peerX509) return;
        this._x509Certificate = peerX509;
        // console.log(`${peerX509}`);
      });

      // データ受信
      socket.once('data', (data) => {
        // レスポンスデータ（ヘッダ）取得
        const nodeBufferView = Buffer.from(new Uint8Array(data).buffer);
        // レスポンスサイズチェック
        const responseDataSize = nodeBufferView.readUInt32LE(0);
        if (responseDataSize === 0) {
          socket.destroy();
          reject('empty data');
        }
        // レスポンスパケットタイプチェック
        const responsePacketType = nodeBufferView.readUInt32LE(4);
        if (responsePacketType !== packetType) {
          socket.destroy();
          reject(`mismatch packet type: expect: ${packetType} actual: ${responsePacketType}`);
        }

        // ヘッダが問題なければデータ部取得
        socket.on('data', (data) => {
          const tempResponseData = new Uint8Array(data);
          //   console.debug(tempResponseData);
          responseSize += tempResponseData.length;
          if (!responseData) {
            // 初回
            responseData = tempResponseData;
          } else {
            // 連結
            const merged = new Uint8Array(responseData.length + tempResponseData.length);
            merged.set(responseData);
            merged.set(tempResponseData, responseData.length);
            responseData = merged;
          }
          if (responseDataSize <= responseSize) {
            // 受信が終わったら終了
            socket.end();
          }
        });
      });

      socket.on('timeout', function () {
        socket.destroy();
        reject('timeout');
      });

      socket.on('error', function (error) {
        socket.destroy();
        reject(error);
      });

      socket.on('close', function () {
        resolve(responseData);
      });
    });
  }
}

import WebSocket from 'ws';
import { FinalizedBlock, NewBlock } from '../model/blockchain';
import {
  Confirmed,
  Cosignature,
  ErrorStatus,
  PartialAdded,
  PartialRemoved,
  UnconfirmedAdded,
  UnconfirmedRemoved,
} from '../model/transaction';

/**
 * 汎用コールバック型
 */
type Callback = (arg: object) => void;

/**
 * Listener
 * WebSocketを管理する。
 */
export class Listener {
  private _wsUrl = '';
  private _uid = '';
  private _functionMap = new Map<string, (arg: object) => void>();
  private _listener: WebSocket | undefined = undefined;

  /**
   * チャンネル名
   */
  private _listenerChannelName = {
    newBlock: 'block',
    finalizedBlock: 'finalizedBlock',
    confirmedAdded: 'confirmedAdded',
    unconfirmedAdded: 'unconfirmedAdded',
    unconfirmedRemoved: 'unconfirmedRemoved',
    partialAdded: 'partialAdded',
    partialRemoved: 'partialRemoved',
    cosignature: 'cosignature',
    status: 'status',
  };

  /**
   * コンストラクタ
   * @param _host ホスト
   * @param _isHttps HTTPs有無(デフォルト: false)
   * @param _isAlwaysConnected 常時接続(デフォルト: false)
   */
  constructor(
    private readonly _host: string,
    private readonly _isHttps: boolean = false,
    private _isAlwaysConnected: boolean = false,
    private readonly timeout: number = 3000
  ) {
    if (this._isHttps) {
      this._wsUrl = `wss://${this._host}:3001/ws`;
    } else {
      this._wsUrl = `ws://${this._host}:3000/ws`;
    }
  }

  /**
   * WebSocket利用可能チェック
   * @returns true: 利用可能
   */
  async isWebsokectAvailable(): Promise<boolean> {
    if (this._listener) return true;
    return new Promise<boolean>((resolve) => {
      const lsnr = new WebSocket(this._wsUrl, { handshakeTimeout: this.timeout });
      lsnr.onopen = (): void => {
        lsnr.close();
        resolve(true);
      };
      lsnr.onerror = (): void => resolve(false);
    });
  }

  /**
   * WebScoketリスナーを開く
   * 常時接続
   * @returns
   */
  async open(): Promise<void> {
    this._isAlwaysConnected = true;
    return new Promise<void>((resolve, reject) => {
      this._listener = new WebSocket(this._wsUrl, { handshakeTimeout: this.timeout });

      /**
       * メッセージ受信時
       * @param ev メッセージイベント
       */
      this._listener.onmessage = (ev: WebSocket.MessageEvent): void => {
        const data = JSON.parse(ev.data.toString());
        if (data.uid && this._uid !== data.uid) {
          this._uid = data.uid;
          console.log(this._uid);
          for (const key of Object.keys(this._functionMap)) {
            this._listener!.send(
              JSON.stringify({
                uid: this._uid,
                subscribe: key,
              })
            );
          }
          resolve();
        } else if (this._functionMap.has(data.topic)) {
          const func = this._functionMap.get(data.topic)!;
          func(data.data);
        }
      };

      /**
       * エラー時
       * @param ev イベント
       */
      this._listener.onerror = (ev: WebSocket.ErrorEvent) => {
        console.error(ev);
        reject();
      };

      /**
       * クローズ時
       * @param ev クローズイベント
       */
      this._listener.onclose = async () => {
        console.log('onClose');
        this._uid = '';
        if (this._isAlwaysConnected) {
          this.open();
          console.log(`reopen: ${this._listener!.url}`);
        } else {
          this._functionMap = new Map<string, (arg: object) => void>();
        }
      };
    });
  }

  /**
   * リスナーを閉じる
   */
  close(): void {
    this._isAlwaysConnected = false;
    this._listener?.close();
  }

  /**
   * 新しいブロック通知
   * @param callback コールバック
   */
  registerNewBlock(callback: (arg: NewBlock) => void) {
    const channelName = this._listenerChannelName.newBlock;
    if (!this._functionMap.has(channelName)) {
      // ブロック生成検知時の処理
      this.addCallback(channelName, callback as Callback);
      // ブロック生成検知設定
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * ファイナライズ通知
   * @param callback コールバック
   */
  registerFinalizedBlock(callback: (arg: FinalizedBlock) => void) {
    const channelName = this._listenerChannelName.finalizedBlock;
    if (!this._functionMap.has(channelName)) {
      // ブロック生成検知時の処理
      this.addCallback(channelName, callback as Callback);
      // ブロック生成検知設定
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * 承認トランザクション通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerConfirmed(address: string, callback: (arg: Confirmed) => void) {
    const channelName = this._listenerChannelName.confirmedAdded + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * 未承認トランザクション追加通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerUnconfirmedAdded(address: string, callback: (arg: UnconfirmedAdded) => void) {
    const channelName = this._listenerChannelName.unconfirmedAdded + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * 未承認トランザクション削除通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerUnconfirmedRemoved(address: string, callback: (arg: UnconfirmedRemoved) => void) {
    const channelName = this._listenerChannelName.unconfirmedRemoved + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * パーシャル追加通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerPartialAdded(address: string, callback: (arg: PartialAdded) => void) {
    const channelName = this._listenerChannelName.partialAdded + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * パーシャル削除通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerPartialRemoved(address: string, callback: (arg: PartialRemoved) => void) {
    const channelName = this._listenerChannelName.partialRemoved + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * 連署通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerCosignature(address: string, callback: (arg: Cosignature) => void) {
    const channelName = this._listenerChannelName.cosignature + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * トランザクションエラー通知
   * @param address 通知対象アドレス
   * @param callback コールバック
   */
  registerStatus(address: string, callback: (arg: ErrorStatus) => void) {
    const channelName = this._listenerChannelName.status + '/' + address;
    if (!this._functionMap.has(channelName)) {
      this.addCallback(channelName, callback as Callback);
      this._listener!.send(
        JSON.stringify({
          uid: this._uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * チャンネルへコールバック追加
   * @param channel チャンネル
   * @param callback コールバック
   */
  private addCallback(channel: string, callback: (arg: object) => void): void {
    this._functionMap.set(channel, callback);
  }
}

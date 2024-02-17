import WebSocket from 'ws';

export class Listener {
  private uid = '';
  private functionMap = new Map<string, (arg: object) => void>();
  private listener: WebSocket | undefined = undefined;
  private isAlwaysConnected = true;

  /**
   * チャンネル名
   */
  private ListenerChannelName = {
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
   * @param wsUrl WebSocketURL
   */
  constructor(private readonly wsUrl: string) {}

  /**
   * WebSocket利用可能チェック
   * @returns true: 利用可能
   */
  async isWebsokectAvailable(): Promise<boolean> {
    if (this.listener) return true;
    return new Promise<boolean>((resolve) => {
      const lsnr = new WebSocket(this.wsUrl);
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
    this.isAlwaysConnected = true;
    return new Promise<void>((resolve, reject) => {
      this.listener = new WebSocket(this.wsUrl);

      /**
       * メッセージ受信時
       * @param ev メッセージイベント
       */
      this.listener.onmessage = (ev: WebSocket.MessageEvent): void => {
        const data = JSON.parse(ev.data.toString());
        if (data.uid && this.uid !== data.uid) {
          this.uid = data.uid;
          for (const key of Object.keys(this.functionMap)) {
            this.listener!.send(
              JSON.stringify({
                uid: this.uid,
                subscribe: key,
              })
            );
          }
          resolve();
        } else if (this.functionMap.has(data.topic)) {
          const func = this.functionMap.get(data.topic)!;
          func(data.data);
        }
      };

      /**
       * エラー時
       * @param ev イベント
       */
      this.listener.onerror = (ev: WebSocket.ErrorEvent) => {
        console.error(ev);
        reject();
      };

      /**
       * クローズ時
       * @param ev クローズイベント
       */
      this.listener.onclose = async () => {
        this.uid = '';
        this.functionMap = new Map<string, (arg: object) => void>();
        if (this.isAlwaysConnected) {
          this.open();
          console.log(`reopen: ${this.listener!.url}`);
        }
      };
    });
  }

  /**
   * リスナーを閉じる
   */
  close(): void {
    this.isAlwaysConnected = false;
    this.listener?.close();
  }

  /**
   * 新しいブロック通知
   * @param callback コールバック
   */
  registerNewBlock(callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.newBlock;
    if (!this.functionMap.has(channelName)) {
      // ブロック生成検知時の処理
      this.addCallback(channelName, callback);
      // ブロック生成検知設定
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
          subscribe: channelName,
        })
      );
    }
  }

  /**
   * ファイナライズ通知
   * @param callback コールバック
   */
  registerFinalizedBlock(callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.finalizedBlock;
    if (!this.functionMap.has(channelName)) {
      // ブロック生成検知時の処理
      this.addCallback(channelName, callback);
      // ブロック生成検知設定
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerConfirmedAdded(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.confirmedAdded + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerUnconfirmedAdded(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.unconfirmedAdded + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerUnconfirmedRemoved(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.unconfirmedRemoved + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerPartialAdded(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.partialAdded + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerPartialRemoved(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.partialRemoved + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerCosignature(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.cosignature + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
  registerStatus(address: string, callback: (arg: object) => void) {
    const channelName = this.ListenerChannelName.status + '/' + address;
    if (!this.functionMap.has(channelName)) {
      this.addCallback(channelName, callback);
      this.listener!.send(
        JSON.stringify({
          uid: this.uid,
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
    this.functionMap.set(channel, callback);
  }
}

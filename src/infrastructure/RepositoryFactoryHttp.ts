import {
  ChainHttp,
  ChainRepository,
  Listener,
  NetworkHttp,
  NetworkRepository,
  NodeHttp,
  NodeRepository,
} from '.';
import { AccountHttp } from './AccountHttp';
import { AccountRepository } from './AccountRepository';

/**
 * リポジトリファクトリーHTTP
 */
export class RepositoryFactoryHttp {
  /**
   * コンストラクタ
   * @param _nodeHost ノードホスト
   * @param _isHttps HTTPs有無（デフォルト：true）
   * @param _timeout タイムアウト（デフォルト：3000）
   */
  constructor(
    private readonly _nodeHost: string,
    private readonly _isHttps: boolean = true,
    private readonly _timeout: number = 3000
  ) {}

  /**
   * ChainRepository生成
   * @returns ChainRepository
   */
  createChainRepository(): ChainRepository {
    return new ChainHttp(this._nodeHost, this._isHttps, this._timeout);
  }

  /**
   * NodeRepository生成
   * @returns NodeRepository
   */
  createNodeRepository(): NodeRepository {
    return new NodeHttp(this._nodeHost, this._isHttps, this._timeout);
  }

  /**
   * NetworkRepository生成
   * @returns NetworkRepository
   */
  createNetworkRepository(): NetworkRepository {
    return new NetworkHttp(this._nodeHost, this._isHttps, this._timeout);
  }

  /**
   * WebSocketListener生成
   * @returns WebSocketListener
   */
  createWebSocketListener(): Listener {
    return new Listener(this._nodeHost, this._isHttps);
  }

  createAccountRepository(): AccountRepository {
    return new AccountHttp(this._nodeHost, this._isHttps, this._timeout);
  }
}

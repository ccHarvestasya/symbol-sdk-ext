import { ChainRepository } from './ChainRepository';
import { ChainSocket } from './ChainSocket';
import { NodeRepository } from './NodeRepository';
import { NodeSocket } from './NodeSocket';

/**
 * リポジトリファクトリーSocket
 */
export class RepositoryFactorySocket {
  /**
   * コンストラクタ
   * @param _nodeHost ノードホスト
   * @param _port ポート(デフォルト：7900)
   * @param _timeout タイムアウト（デフォルト：3000）
   */
  constructor(
    private readonly _nodeHost: string,
    private readonly _port: number = 7900,
    private readonly _timeout: number = 3000
  ) {}

  /**
   * ChainRepository生成
   * @returns ChainRepository
   */
  createChainRepository(): ChainRepository {
    return new ChainSocket(this._nodeHost, this._port, this._timeout);
  }

  /**
   * NodeRepository生成
   * @returns NodeRepository
   */
  createNodeRepository(): NodeRepository {
    return new NodeSocket(this._nodeHost, this._port, this._timeout);
  }
}

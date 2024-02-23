import { FinalizedBlock } from './FinalizedBlock';

/**
 * ChainInfo
 */
export class ChainInfo {
  /**
   * コンストラクタ
   * @param height ブロック高
   * @param scoreHigh スコア高
   * @param scoreLow スコア低
   * @param latestFinalizedBlock ファイナライズブロック
   */
  constructor(
    /**
     * ブロック高
     */
    public readonly height: string,

    /**
     * スコア高
     */
    public readonly scoreHigh: string,

    /**
     * スコア低
     */
    public readonly scoreLow: string,

    /**
     * ファイナライズブロック
     */
    public readonly latestFinalizedBlock: FinalizedBlock
  ) {}
}

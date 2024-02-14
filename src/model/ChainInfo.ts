export class ChainInfo {
  /**
   * ブロック高
   */
  height?: string;

  /**
   * スコア高
   */
  scoreHigh?: string;

  /**
   * スコア低
   */
  scoreLow?: string;

  /**
   * ファイナライズブロック
   */
  latestFinalizedBlock?: {
    /**
     * ファイナライゼーションエポック
     */
    finalizationEpoch?: number;

    /**
     * ファイナライゼーションポイント
     */
    finalizationPoint?: number;

    /**
     * ファイナライズブロック高
     */
    height?: string;

    /**
     * ファイナライズハッシュ
     */
    hash?: string;
  };
}

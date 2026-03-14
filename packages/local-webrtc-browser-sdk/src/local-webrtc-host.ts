/** ローカルWebRTCホスト */
export type LocalWebRTCHost = {
  /**
   * ルームを生成する
   * @returns 生成されたルームのID、生成に失敗した場合はnull
   */
  createRoom: () => Promise<string | null>;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<void>;
};

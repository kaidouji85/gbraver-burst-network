// @flow

/** クライアントSDK スタブ */
export interface Stub {
  /**
   * スタブ名
   */
  name(): string;

  /**
   * スタブを実行する
   * 
   * @return 実行終了後に発火するPromise
   */
  execute(): Promise<void>
}
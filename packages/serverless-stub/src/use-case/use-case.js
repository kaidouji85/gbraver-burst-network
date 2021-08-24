// @flow

/** ユースケース */
export interface UseCase {
  /** ユースケース名 */
  name(): string;

  /**
   * ユースケースを実行する
   *
   * @return ユースケースが完了したら発火するPromise
   */
  execute(): Promise<void>
}
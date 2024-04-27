/** ユースケース実行条件 */
export type UseCaseContext = {
  /** プライベートマッチルームのID */
  privateMatchRoomID: string;
};

/** ユースケース */
export interface UseCase {
  /** ユースケース名 */
  name(): string;

  /**
   * ユースケースを実行する
   * @param context コンテクスト
   * @returns ユースケースが完了したら発火するPromise
   */
  execute(context: UseCaseContext): Promise<void>;
}

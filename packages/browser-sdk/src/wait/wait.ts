/**
 * 指定された時間待機する
 *
 * @param ms ミリ秒単位で指定する待ち時間
 * @return 待ち時間が終了したら発火するPromise
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

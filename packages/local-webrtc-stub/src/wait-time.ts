/**
 * 指定した時間(ms)待機するPromiseを返す
 * @param ms 待機する時間(ms)
 * @returns 指定した時間待機するPromise
 */
export const waitTime = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

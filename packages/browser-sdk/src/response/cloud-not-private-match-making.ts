/** プライベートマッチングできなかった */
export type CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making";
};

/**
 * 任意オブジェクトをCouldNotPrivateMatchMakingにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseCouldNotPrivateMatchMaking(
  origin: any
): CouldNotPrivateMatchMaking | null {
  /* eslint-enable */
  if (origin?.action === "cloud-not-private-match-making") {
    return {
      action: "cloud-not-private-match-making",
    };
  }
  return null;
}

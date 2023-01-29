/** プライベートマッチの相手に選ばれなかった */
export type NotChosenAsPrivateMatchPartner = {
  action: "not-chosen-as-private-match-partner";
};

/**
 * 任意オブジェクトをNotChosenAsPrivateMatchPartnerにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseNotChosenAsPrivateMatchPartner(
  origin: any
): NotChosenAsPrivateMatchPartner | null {
  /* eslint-enable */
  if (origin?.action === "not-chosen-as-private-match-partner") {
    return {
      action: "not-chosen-as-private-match-partner",
    };
  }
  return null;
}

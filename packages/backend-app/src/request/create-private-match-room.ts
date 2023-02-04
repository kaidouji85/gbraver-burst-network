/** プライベートマッチルーム生成 */
export type CreatePrivateMatchRoom = {
  action: "create-private-match-room";

  /** 選択したアームドーザのID */
  armdozerId: string;

  /** 選択したパイロットのID */
  pilotId: string;
};

/**
 * 任意オブジェクトをCreatePrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseCreatePrivateMatchRoom(
  origin: any
): CreatePrivateMatchRoom | null {
  /* eslint-enable */
  if (
    origin?.action === "create-private-match-room" &&
    typeof origin?.armdozerId === "string" &&
    typeof origin?.pilotId === "string"
  ) {
    return {
      action: "create-private-match-room",
      armdozerId: origin.armdozerId,
      pilotId: origin.pilotId,
    };
  }
  return null;
}

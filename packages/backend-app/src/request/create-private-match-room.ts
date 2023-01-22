/** プライベートマッチルーム生成 */
export type CreatePrivateMatchRoom = {
  action: "create-private-match-room";

  /** 選択したアームドーザのID */
  armdozerId: string;

  /** 選択したパイロットのID */
  pilotId: string;
};

/**
 * CreatePrivateMatchRoomか否かを判定する
 * @param origin 判定元
 * @return 判定結果、trueでCreatePrivateMatchRoomである
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function isCreatePrivateMatchRoom(
  origin: any
): origin is CreatePrivateMatchRoom {
  /* eslint-enable */
  return (
    origin?.action === "create-private-match-room" &&
    typeof origin?.armdozerId === "string" &&
    typeof origin?.pilotId === "string"
  );
}

import { PrivateMatchRoomID } from "@gbraver-burst-network/browser-core";

/** プライベートマッチルーム破棄 */
export type DestroyPrivateMatchRoom = {
  action: "destroy-private-match-room";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};

/**
 * 任意オブジェクトをDestroyPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseDestroyPrivateMatchRoom(
  origin: any
): DestroyPrivateMatchRoom | null {
  /* eslint-enable */
  if (
    origin?.action === "destroy-private-match-room" &&
    typeof origin?.roomID === "string"
  ) {
    return {
      action: "destroy-private-match-room",
      roomID: origin.roomID,
    };
  }
  return null;
}

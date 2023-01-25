import { PrivateMatchRoomID } from "../core/private-match-room";

/** プライベートルームマッチポーリング */
export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};

/**
 * PrivateMatchMakePollingにパースする
 * パースできない場合、nullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parsePrivateMatchMakePolling(
  origin: any
): PrivateMatchMakePolling | null {
  /* eslint-enable */
  if (
    origin?.action === "private-match-make-polling" &&
    typeof origin?.roomID === "string"
  ) {
    return {
      action: "private-match-make-polling",
      roomID: origin.roomID,
    };
  }
  return null;
}

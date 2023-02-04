/** オーナーがプライベートマッチルーム作成に成功した */
export type CreatedPrivateMatchRoom = {
  action: "created-private-match-room";

  /** 作成したルームID */
  roomID: string;
};

/**
 * 任意オブジェクトをCreatedPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param data パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseCreatedPrivateMatchRoom(
  data: any
): CreatedPrivateMatchRoom | null {
  /* eslint-enable */
  if (
    data?.action === "created-private-match-room" &&
    typeof data?.roomID === "string"
  ) {
    return {
      action: "created-private-match-room",
      roomID: data.roomID,
    };
  }
  return null;
}

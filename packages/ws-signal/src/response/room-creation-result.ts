/** ルーム生成成功 */
export type RoomCreationSuccess = {
  type: "room-creation-result";
  /** ルーム生成が成功したか否か、成功したのでtrue */
  isSuccess: true;
  /** ルームID */
  roomID: string;
};

/** ルーム生成失敗 */
export type RoomCreationFailure = {
  type: "room-creation-result";
  /** ルーム生成が成功したか否か、失敗したのでfalse */
  isSuccess: false;
};

/** ルーム生成結果 */
export type RoomCreationResult = RoomCreationSuccess | RoomCreationFailure;

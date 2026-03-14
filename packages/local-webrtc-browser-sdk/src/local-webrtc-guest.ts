/** ローカルWebRTCゲスト */
export type LocalWebRTCBrowserSDK = {
  /**
   * ルームに参加する
   * @param roomID ルームID
   * @returns ルームへの参加に成功したらtrue、失敗したらfalse
   */
  joinRoom: (roomID: string) => Promise<boolean>;
};

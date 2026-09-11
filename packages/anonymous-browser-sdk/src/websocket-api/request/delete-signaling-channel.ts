/** シグナリングチャネルを削除する */
export type DeleteSignalingChannel = {
  action: "delete-signaling-channel";
  /** 削除対象となるシグナリングのID */
  signalingID: string;
};

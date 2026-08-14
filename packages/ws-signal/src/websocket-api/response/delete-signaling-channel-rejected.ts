/** シグナリングチャネルの削除が拒否された */
export type DeleteSignalingChannelRejected = {
  type: "delete-signaling-channel-rejected";
  /** 削除対象となるシグナリングのID */
  signalingID: string;
};

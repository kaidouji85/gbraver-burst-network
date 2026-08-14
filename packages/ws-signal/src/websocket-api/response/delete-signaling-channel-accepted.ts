/** シグナリングチャネルの削除に成功した */
export type DeleteSignalingChannelAccepted = {
  type: "delete-signaling-channel-accepted";
  /** 削除対象となるシグナリングのID */
  signalingID: string;
};

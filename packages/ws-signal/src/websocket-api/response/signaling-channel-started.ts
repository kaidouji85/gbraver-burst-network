/** シグナリングチャネル開始 */
export type SignalingChannelStarted = {
  type: "signaling-channel-started";
  /** シグナリングID */
  signalingID: string;
};

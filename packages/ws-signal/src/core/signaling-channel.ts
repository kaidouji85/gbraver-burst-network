/** シグナリング チャネル */
export type SignalingChannel = {
  /** シグナリングID */
  signalingID: string;
  /** ホストのWebSocket API Gateway コネクションID */
  hostConnectionId: string;
  /** ゲストのWebSocket API Gateway コネクションID */
  guestConnectionId: string;
};

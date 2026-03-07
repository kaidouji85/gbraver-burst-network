/** 状態なし */
export type None = {
  type: "None";
};

/** コネクションステート */
export type ConnectionState = None;

/** コネクション */
export type Connection = {
  /** API GatewayでのコネクションID */
  connectionId: string;
  /** ステート */
  state: ConnectionState;
};

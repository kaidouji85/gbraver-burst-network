/** ログ：シグナリング開始 */
export type SignalingStart = {
  type: "SIGNALING_START";
  /** スパンID */
  spanId: string;
};

/** ログ：シグナリング終了 */
export type SignalingEnd = {
  type: "SIGNALING_END";
  /** スパンID */
  spanId: string;
};

/** ログ：ICE候補収集エラー */
export type ICECandidateError = {
  type: "ICE_CANDIDATE_ERROR";
  /** スパンID */
  spanId: string;
  /** エラーメッセージ */
  error: string;
};

/** ログ：ICE候補送信開始 */
export type ICECandidateStart = {
  type: "ICE_CANDIDATE_START";
  /** スパンID */
  spanId: string;
};

/** ログ：ICE候補送信終了 */
export type ICECandidateEnd = {
  type: "ICE_CANDIDATE_END";
  /** スパンID */
  spanId: string;
};

/** フロントエンドログ */
export type FrontendLog =
  | ICECandidateStart
  | ICECandidateEnd
  | ICECandidateError
  | SignalingStart
  | SignalingEnd;

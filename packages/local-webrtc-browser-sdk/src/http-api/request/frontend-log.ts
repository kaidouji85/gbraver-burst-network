/** 選択されたICE Candidateの概要 */
export type SelectedIceCandidateSummary = {
  type: "SELECTED_ICE_CANDIDATE_SUMMARY";
  /** ICE Candidate概要 */
  summary: string;
};

/** ログ：ICE候補収集エラー */
export type ICECandidateError = {
  type: "ICE_CANDIDATE_ERROR";
  /** スパンID */
  spanId: string;
  /** エラーメッセージ */
  error: string;
};

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

/** フロントエンドログ */
export type FrontendLog =
  | SelectedIceCandidateSummary
  | ICECandidateError
  | SignalingStart
  | SignalingEnd;

/** 何らかの理由でプライベートマッチに参加できなかった */
export type RejectRematchEntry = {
  action: "reject-rematch-entry";
};

/** 何らかの理由でプライベートマッチに参加できなかった（定数） */
export const REJECT_REMATCH_ENTRY: RejectRematchEntry = {
  action: "reject-rematch-entry",
};

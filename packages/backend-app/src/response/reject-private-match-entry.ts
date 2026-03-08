/** 何らかの理由でプライベートマッチに参加できなかった */
export type RejectPrivateMatchEntry = {
  action: "reject-private-match-entry";
};

/** 何らかの理由でプライベートマッチに参加できなかった（定数） */
export const REJECT_PRIVATE_MATCH_ENTRY: RejectPrivateMatchEntry = {
  action: "reject-private-match-entry",
};

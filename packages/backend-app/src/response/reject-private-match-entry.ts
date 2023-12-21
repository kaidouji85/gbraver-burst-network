import { RejectPrivateMatchEntry } from "./websocket-response";

/** 何らかの理由でプライベートマッチに参加できなかった */
export const rejectPrivateMatchEntry: RejectPrivateMatchEntry = {
  action: "reject-private-match-entry",
};

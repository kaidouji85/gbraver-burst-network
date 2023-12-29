import type {NotReadyBattleProgress} from "./websocket-response";

/** クライアント通知 コマンド入力が完了していない */
export const notReadyBattleProgress: NotReadyBattleProgress = {
  action: "not-ready-battle-progress",
};
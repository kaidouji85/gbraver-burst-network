import { Battle } from "./battle";

/**
 * バトルを進めてよいかを判断する
 * 両プレイヤーから同じflowIdのコマンドが揃った場合にtrueを返す
 * @param battle バトル情報
 * @returns バトルを進めてよい場合はtrue、そうでない場合はfalse
 */
export function shouldBattleProgress(battle: Battle): boolean {
  if (battle.flowId === "") {
    return false;
  }

  const receivedCommandFlowIds = Array.from(battle.commands.values()).map(
    (c) => c.flowId,
  );
  // すべてのプレイヤー(2人)からコマンドが届き、全て同じflowIdであることを確認
  return (
    receivedCommandFlowIds.length === 2 &&
    receivedCommandFlowIds.every((flowId) => flowId === battle.flowId)
  );
}

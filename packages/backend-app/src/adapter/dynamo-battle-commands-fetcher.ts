import { BattlePlayer } from "../core/battle/battle";
import { BattleCommand } from "../core/battle/battle-command";
import { BattleCommandsFetcher } from "../core/battle/battle-commands-fetcher";
import { DynamoBattleCommands } from "../dynamo-db/dynamo-battle-commands";

/** DynamoDBからゲーム参加プレイヤーのバトルコマンドを取得する */
export class DynamoBattleCommandsFetcher implements BattleCommandsFetcher {
  /** DynamoDB バトルコマンドテーブル DAO */
  #dynamoBattleCommands: DynamoBattleCommands;

  /**
   * コンストラクタ
   * @param dynamoBattleCommands バトルコマンドテーブルDAO
   */
  constructor(dynamoBattleCommands: DynamoBattleCommands) {
    this.#dynamoBattleCommands = dynamoBattleCommands;
  }

  /** @override */
  async fetch(
    players: [BattlePlayer, BattlePlayer],
  ): Promise<[BattleCommand, BattleCommand] | null> {
    const fetchedCommands = await Promise.all([
      this.#dynamoBattleCommands.get(players[0].userID),
      this.#dynamoBattleCommands.get(players[1].userID),
    ]);
    return fetchedCommands[0] && fetchedCommands[1]
      ? [fetchedCommands[0], fetchedCommands[1]]
      : null;
  }
}

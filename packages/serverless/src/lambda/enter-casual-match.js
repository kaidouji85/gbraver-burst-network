// @flow

import {parseJSON} from "../json/parse";

/** カジュアルマッチエントリのデータ */
export type EnterCasualMatchBody = {
  action: 'enterCasualMatch',
  armdozerId: string,
  pilotId: string,
}

/**
 * リクエストボディをカジュアルマッチエントリに変換する
 * 変換でいない場合はnullを返す
 *
 * @param origin 変換元のリクエストボディ
 * @return 変換結果
 */
export function parseEnterCasualMatchBody(origin: string): ?EnterCasualMatchBody {
  let json = parseJSON(origin);
  return(
    (json?.action  === 'enterCasualMatch')
    && (typeof json?.armdozerId === 'string')
    && (typeof json?.pilotId === 'string')
  )
    ? {action: json.action, armdozerId: json.armdozerId, pilotId: json.pilotId}
    : null;
}
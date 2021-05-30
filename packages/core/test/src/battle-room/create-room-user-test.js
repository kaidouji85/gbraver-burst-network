// @flow

import test from 'ava';
import {createRoomUser} from "../../../src/battle-room/room-user";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";

test('バトルルームユーザを正しく作成することができる', t => {
  const result = createRoomUser('test', ArmDozerIdList.NEO_LANDOZER, PilotIds.RAITO);
  t.truthy(result);
});

test('存在しないアームドーザID、パイロットIDを指定すると、生成に失敗する', t => {
  const result = createRoomUser('test', 'no-exist-armdozer', 'no-exist-pilot');
  t.is(result, null);
});

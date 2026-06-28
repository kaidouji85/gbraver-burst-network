import * as crypto from "crypto";

import { createRoomID } from "../../src/core/create-room-id";

jest.mock("crypto", () => ({
  randomInt: jest.fn(),
}));

/**
 * モック用のランダムインデックス生成関数
 * 以下のように、引数に指定したインデックスを順番に返すようにしている
 * 例: kanaIndexes(0, 1, 2)
 *     0 -> あ
 *     1 -> い
 *     2 -> う
 * @param indexes 返すインデックスの配列
 */
const kanaIndexes = (...indexes: number[]) =>
  jest.mocked(crypto.randomInt).mockImplementation(() => {
    const index = indexes.shift();
    if (index === undefined) {
      throw new Error("randomInt is called more times than expected");
    }

    return index;
  });

afterEach(() => {
  jest.clearAllMocks();
});

test("NGワードを含まないルームIDを返す", () => {
  kanaIndexes(5, 6, 7, 8, 9);
  const roomID = createRoomID(["あい", "さし"]);
  expect(roomID).toBe("かきくけこ");
});

test("NGワードを含む候補は失敗としてnullを返す", () => {
  kanaIndexes(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
  const roomID = createRoomID(["あい"]);
  expect(roomID).toBeNull();
});

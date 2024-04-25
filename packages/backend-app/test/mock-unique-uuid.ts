/**
 * UUIDのモック関数を生成する
 *
 * 使用例
 * const mockUUID = mockUniqUUID();
 * mockUUID(); // => mock-id-1
 * mockUUID(); // => mock-id-2
 * mockUUID(); // => mock-id-3
 *
 * ネット対戦ではプレイヤーIDにUUIDをセットすることが多い
 * ただし、Gブレイバーバーストのコアロジックでは同じユーザIDの重複は許されないため、
 * テストコードではユニークなUUIDを生成する必要がある
 * @returns モック用UUIDを生成する関数
 */
export const mockUniqUUID = () => {
  let count = 1;
  return () => {
    const generatedUUID = `mock-id-${count}`;
    count++;
    return generatedUUID;
  };
};

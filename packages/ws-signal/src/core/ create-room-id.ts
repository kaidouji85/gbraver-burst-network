import * as crypto from "crypto";
import * as R from "ramda";

/** ひらがな表 */
const kana = [
  ...["あ", "い", "う", "え", "お"],
  ...["か", "き", "く", "け", "こ"],
  ...["さ", "し", "す", "せ", "そ"],
  ...["た", "ち", "つ", "て", "と"],
  ...["な", "に", "ぬ", "ね", "の"],
  ...["は", "ひ", "ふ", "へ", "ほ"],
  ...["ま", "み", "む", "め", "も"],
  ...["や", "ゆ", "よ"],
  ...["ら", "り", "る", "れ", "ろ"],
  ...["わ", "を", "ん"],
];

/** パスワードの文字数 */
const PASSWORD_LENGTH = 5;

/**
 * ランダムなルームIDを生成する
 * @return 生成されたルームID
 */
export function createRoomId(): string {
  return R.times(() => {
    const index = crypto.randomInt(0, kana.length - 2);
    return kana[index];
  }, PASSWORD_LENGTH).join("");
}

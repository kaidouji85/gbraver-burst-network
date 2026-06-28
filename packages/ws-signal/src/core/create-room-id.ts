import * as crypto from "crypto";

/** ひらがな表 */
const kana = [
  // prettierで一文字ずつ改行されるのを防ぐため、
  // 行ごとにスプレッド構文で展開している
  ...["あ", "い", "う", "え", "お"],
  ...["か", "き", "く", "け", "こ"],
  ...["さ", "し", "す", "せ", "そ"],
  ...["た", "ち", "つ", "て", "と"],
  ...["な", "に", "ぬ", "ね", "の"],
  ...["は", "ひ", "ふ", "へ", "ほ"],
  ...["ま", "み", "む", "め", "も"],
  ...["や", "ゆ", "よ"],
  ...["ら", "り", "る", "れ", "ろ"],
  // 「お」と「を」は発音が同じなので、「お」のみを使用する
  ...["わ", /*"を",*/ "ん"],
];

/** ルームIDの文字数 */
const ROOM_ID_LENGTH = 5;

/** ルームIDの最大生成試行回数 */
const MAX_ROOM_CREATION_RETRY = 5;

/**
 * デフォルトのNGワード
 * NGワードをコードに直接記載するのは憚られたので、Unicodeエスケープシーケンスで記載している
 */
const DEFAULT_NG_WORDS = [
  "\u3057\u306d",
  "\u3053\u308d\u3059",
  "\u3061\u3093",
  "\u307e\u3093",
];

/**
 * ランダムなルームIDを生成する
 * @param ngWords NGワードの配列。指定しない場合はデフォルトのNGワードが使用される
 * @return 生成されたルームID
 */
export const createRoomID = (ngWords: string[] = DEFAULT_NG_WORDS): string => {
  for (let i = 0; i < MAX_ROOM_CREATION_RETRY; i++) {
    const roomID = Array.from(
      { length: ROOM_ID_LENGTH },
      () => kana[crypto.randomInt(kana.length)],
    ).join("");
    const hasNGWord = ngWords.some((ngWord) => roomID.includes(ngWord));
    if (!hasNGWord) {
      return roomID;
    }
  }

  throw new Error("failed to create room ID after maximum retries");
};

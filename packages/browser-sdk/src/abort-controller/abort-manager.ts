/**
 * Abort管理オブジェクト
 * Abortされた場合にあたらしいAbortControllerを生成する
 * 本クラスはゲーム内で一つのみ生成される想定である
 */
export class AbortManager {
  /** 現在有効なAbortController */
  #abortController: AbortController;

  /**
   * プライベート関数#onAbortをthisでbindした関数
   * bind(this)は新しい関数を生成するため、以下コードではコールバック関数の削除が正しく行えない
   * そのため、本プロパティにbindした関数を保持し、コールバック関数の削除を行えるようにする。
   *
   * ```typescript
   * abortController.signal.addEventListener("abort", this.#onAbort.bind(this));
   * abortController.signal.removeEventListener("abort", this.#onAbort.bind(this));
   * ```
   * @private
   */
  readonly #onAbortBound: () => void;

  /**
   * コンストラクタ
   */
  constructor() {
    this.#abortController = new AbortController();
    this.#onAbortBound = this.#onAbort.bind(this);
    this.#abortController.signal.addEventListener("abort", this.#onAbortBound);
  }

  /**
   * 現在有効なAbortControllerを取得する
   * @returns 取得結果
   */
  getAbortController(): AbortController {
    return this.#abortController;
  }

  /**
   * AbortControllerがabortされた際の処理
   * @private
   */
  #onAbort() {
    this.#abortController.signal.removeEventListener(
      "abort",
      this.#onAbortBound,
    );

    this.#abortController = new AbortController();
    this.#abortController.signal.addEventListener("abort", this.#onAbortBound);
  }
}

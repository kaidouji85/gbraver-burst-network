// @flow

import type {CasualMatch} from "./casual-match";

/**
 * Gブレイバーバーストのネットワーク系機能をまとめたもの
 * 本インタフェースを実装したクラスは、
 *
 *   (1)ログインユーザトークンを内部的に保持している
 *   (2)(1)をWebAPIに適切にセットしている
 *   (3)(1)の有効期限が切れたら、更新処理を自動的に行う
 *
 * という処理を行うことを想定している
 */
export interface GBraverBurstNetwork extends CasualMatch {
  /**
   * ログオフする
   *
   * @return ログオフ成功したら発火するPromise
   */
  logout(): Promise<void>;
}
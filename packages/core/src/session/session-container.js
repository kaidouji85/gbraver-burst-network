// @flow

import type {Session} from "./session";

/** セッション追加 */
export interface AddSession {
  /**
   * コンテナにセッションを追加する
   *
   * @param session 追加するセッション
   */
  add(session: Session): void;
}

/** 全セッション取得 */
export interface AllSessions {
  /**
   * コンテナに登録されている全セッションを取得する
   *
   * @return 取得結果
   */
  sessions(): Session[];
}

/** セッションコンテナ */
export class SessionContainer implements AddSession, AllSessions {
  _sessions: Session[];

  /** コンストラクタ */
  constructor() {
    this._sessions = [];
  }

  /**
   * コンテナにセッションを追加する
   *
   * @param session 追加するセッション
   */
  add(session: Session): void {
    this._sessions = [...this._sessions, session];
  }

  /**
   * コンテナに登録されている全セッションを取得する
   *
   * @return 取得結果
   */
  sessions(): Session[] {
    return this._sessions;
  }
}
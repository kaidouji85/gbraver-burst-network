// @flow

import type {Session, SessionID} from "./session";

/** セッション追加 */
export interface AddSession {
  /**
   * コンテナにセッションを追加する
   *
   * @param session 追加するセッション
   */
  add(session: Session): void;
}

/** ID指定でのセッション検索 */
export interface FindSession {
  /**
   * ID指定でセッションを検索する
   * 該当するものがない場合、nullを返す
   * 
   * @param sessionID セッションID
   * @return 検索結果 
   */
  find(sessionID: SessionID): ?Session;
}

/** セッションコンテナ */
export class SessionContainer implements AddSession, FindSession {
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

  /**
   * ID指定でセッションを検索する
   * 該当するものがない場合、nullを返す
   * 
   * @param sessionID セッションID
   * @return 検索結果 
   */
  find(sessionID: SessionID): ?Session {
    return this._sessions.find(v => v.id === sessionID) ?? null;
  }
}
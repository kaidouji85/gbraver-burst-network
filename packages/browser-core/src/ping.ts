export interface Ping {
  /**
   * APIサーバと疎通確認を行う
   *
   * @return APIサーバから返されたメッセージ
   */
  ping(): Promise<string>;
}

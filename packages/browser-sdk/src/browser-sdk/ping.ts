export interface Ping {
  /**
   * APIサーバと疎通確認を行う
   *
   * @returns APIサーバから返されたメッセージ
   */
  ping(): Promise<string>;
}

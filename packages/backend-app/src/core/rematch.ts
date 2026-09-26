import { UserID } from "./user";

/** 再戦ID（ユニークな識別子） */
export type RematchId = string;

/** 再戦管理オブジェクト */
export type Rematch = {
  /** 再戦ID */
  id: RematchId;
  /** ホストユーザーID */
  hostUserID: UserID;
  /** ゲストユーザーID */
  guestUserID: UserID;
  /** 再戦の有効期限（Unix秒） */
  expiresAt: number;
};
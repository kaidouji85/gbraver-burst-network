// @flow

/**
 * Promise resolve関数
 * @template X resolveするデータの型
 */
export type Resolve<X> = (result: X | Promise<X>) => void;

/** Promise reject関数 */
export type Reject = (error: any) => void;

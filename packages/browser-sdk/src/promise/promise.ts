/**
 * Promise resolve関数
 * @template X resolveするデータの型
 */
export type Resolve<X> = (result: X | Promise<X>) => void;

/** Promise reject関数 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Reject = (error: any) => void;
/* eslint-enable */
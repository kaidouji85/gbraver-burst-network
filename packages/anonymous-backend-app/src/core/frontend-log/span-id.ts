import { z } from "zod";

/** スパンIDの最大長 */
export const MAX_SPAN_ID_LENGTH = 64;

/** スパンID系プロパティを持つログの型に共通で使用するための型 */
export type SpanIdContainer = {
  /** スパンID */
  spanId: string;
};

/** SpanIdContainer zodスキーマ */
export const SpanIdContainerSchema = z.object({
  spanId: z.string().max(MAX_SPAN_ID_LENGTH),
});

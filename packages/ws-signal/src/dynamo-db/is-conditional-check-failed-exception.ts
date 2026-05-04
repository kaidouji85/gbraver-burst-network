/**
 * ConditionalCheckFailedExceptionであるか否かを判定する
 * @param error 判定対象
 * @returns trueであればConditionalCheckFailedException、そうでなければfalse
 */
export function isConditionalCheckFailedException(error: unknown): boolean {
  return (
    error instanceof Error && error.name === "ConditionalCheckFailedException"
  );
}

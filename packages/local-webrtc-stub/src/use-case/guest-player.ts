import { UseCase, UseCaseContext } from "./use-case";

/** ゲスト側プレイヤー */
export class GuestPlayer implements UseCase {
  /** @override */
  name(): string {
    return "ゲスト側プレイヤー";
  }

  /** @override */
  async execute(context: UseCaseContext): Promise<void> {
    console.log("ゲスト側プレイヤーを実行", context);
  }
}

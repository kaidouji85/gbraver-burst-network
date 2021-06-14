// @flow

import type {Stub} from "./stub";

/** スタブセレクタ */
export class StubSelector {
  _root: HTMLElement;

  constructor(stubs: Stub[]) {
    const stubSelector: HTMLSelectElement = document.createElement('select');
    const options = stubs.map((v, index) => {
      const option: HTMLOptionElement = document.createElement('option');
      option.value = `${index}`;
      option.innerText = v.name();
      return option;
    });
    options.forEach(v => {
      stubSelector.appendChild(v);
    });

    const executeButton: HTMLButtonElement = document.createElement('button');
    executeButton.innerText = '実行';
    const onExecuteButtonPush = async (e: Event): Promise<void> => {
      e.preventDefault();
      e.stopPropagation();
      const targetIndex = parseInt(stubSelector.value);
      const target = stubs[targetIndex];
      console.log(`${target.name()} start`);
      await target.execute();
      console.log('end');
    };
    executeButton.addEventListener('click', onExecuteButtonPush);
    executeButton.addEventListener('pushStart', onExecuteButtonPush);

    this._root = document.createElement('div');
    const underRoot = [stubSelector, executeButton];
    underRoot.forEach(v => {
      this._root.appendChild(v);
    });
  }

  /**
   * ルートのHTML要素を取得する
   *
   * @return 取得結果
   */
  getRootHTMLElement(): HTMLElement {
    return this._root;
  }
}
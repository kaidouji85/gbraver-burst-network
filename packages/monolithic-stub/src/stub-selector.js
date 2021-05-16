// @flow

import type {Stub} from "./stub";

/** スタブセレクタ */
export class StubSelector {
  _root: HTMLElement;

  constructor(stubs: Stub[]) {
    const selectorID = 'stub-selector';
    this._root = document.createElement('div');
    this._root.innerHTML = `
      <select id="${selectorID}" name="stub-selector"></select>
      <button>実行</button>
    `;

    const stubSelector = this._root.querySelector(`#${selectorID}`)
      ?? document.createElement('select');
    const options = stubs.map(v => {
      const option: HTMLOptionElement = document.createElement('option');
      option.value = v.name();
      option.innerText = v.name();
      return option;
    });
    options.forEach(v => {
      stubSelector.appendChild(v);
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
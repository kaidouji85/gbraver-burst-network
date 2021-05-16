// @flow

import {StubSelector} from "./stub-selector";
import {createStubContainer} from "./stub-container";

window.onload = () => {
  const stubContainer = createStubContainer('http://localhost:3000', 'user', 'pass');
  const stubSelector = new StubSelector(stubContainer);
  const stubSelectorBinder: HTMLElement = document.querySelector('#stub-selector')
    ?? document.createElement('div');
  stubSelectorBinder.appendChild(stubSelector.getRootHTMLElement());
};
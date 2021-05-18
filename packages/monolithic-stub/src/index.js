// @flow

import {StubSelector} from "./stub/stub-selector";
import {createStubContainer} from "./stub/stub-container";
import {WebpackDefinePlugin} from './webpack-define-plugin';

window.onload = () => {
  console.log(WebpackDefinePlugin);
  const stubContainer = createStubContainer(WebpackDefinePlugin.API_SERVER_URL, WebpackDefinePlugin.USER_ID, WebpackDefinePlugin.PASSWORD);
  const stubSelector = new StubSelector(stubContainer);
  const stubSelectorBinder: HTMLElement = document.querySelector('#stub-selector')
    ?? document.createElement('div');
  stubSelectorBinder.appendChild(stubSelector.getRootHTMLElement());
};
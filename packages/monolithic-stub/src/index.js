// @flow

import {StubSelector} from "./stub/stub-selector";
import {createStubContainer} from "./stub/stub-container";
import {WebpackDefinePlugin} from './webpack-define-plugin';

window.onload = () => {
  const param = {
    url: WebpackDefinePlugin.API_SERVER_URL,
    userID: WebpackDefinePlugin.USER_ID_1,
    password: WebpackDefinePlugin.PASSWORD_1,
    invalidUserID: WebpackDefinePlugin.INVALID_USER_ID,
    invalidPassword: WebpackDefinePlugin.INVALID_PASSWORD,
  };
  const stubContainer = createStubContainer(param);
  const stubSelector = new StubSelector(stubContainer);
  const stubSelectorBinder: HTMLElement = document.querySelector('#stub-selector')
    ?? document.createElement('div');
  stubSelectorBinder.appendChild(stubSelector.getRootHTMLElement());
};
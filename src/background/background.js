'use strict';

/*
Default settings. Initialize storage to these values.
*/
var addonSettings = {
  longMonth: true,
};

/*
Generic error logger.
*/
function onError(e) {
  console.error(e);
}

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.addonSettings) {
    browser.storage.local.set({ addonSettings });
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

/* globals browser */
var init = async () => {
  browser.ThunvatarApi.addWindowListener('hich');
};

init();

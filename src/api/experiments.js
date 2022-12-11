// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.

"use strict";

var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { ExtensionSupport } = ChromeUtils.import(
  "resource:///modules/ExtensionSupport.jsm"
);
var { ExtensionParent } = ChromeUtils.import(
  "resource://gre/modules/ExtensionParent.jsm"
);

const EXTENSION_NAME = "thunvatar@mikaleb.com";
var extension = ExtensionParent.GlobalManager.getExtension(EXTENSION_NAME);

//customizeable options
// var monthStyle = "long";
// Implements the functions defined in the experiments section of schema.json.
var ThunvatarApi = class extends ExtensionCommon.ExtensionAPI {
  onStartup() {}

  onShutdown(isAppShutdown) {
    if (isAppShutdown) return;
    // Looks like we got uninstalled. Maybe a new version will be installed now.
    // Due to new versions not taking effect (https://bugzilla.mozilla.org/show_bug.cgi?id=1634348)
    // we invalidate the startup cache. That's the same effect as starting with -purgecaches
    // (or deleting the startupCache directory from the profile).
    Services.obs.notifyObservers(null, "startupcache-invalidate");
  }

  getAPI(context) {
    context.callOnClose(this);
    return {
      ThunvatarApi: {
        addWindowListener() {
          // Adds a listener to detect new windows.
          ExtensionSupport.registerWindowListener(EXTENSION_NAME, {
            chromeURLs: [
              "chrome://messenger/content/messenger.xul",
              "chrome://messenger/content/messenger.xhtml",
            ],
            onLoadWindow: paint,
            onUnloadWindow: unpaint,
          });
        },
        changeSettings(_newSettings) {
          // if (newSettings.longMonth) {
          //   monthStyle = "long";
          // }
          for (let win of Services.wm.getEnumerator("mail:3pane")) {
            win.ThunvatarApi.ThunvatarHeaderView.destroy();
            win.ThunvatarApi.ThunvatarHeaderView.init(win);
          }
        },
      },
    };
  }

  close() {
    ExtensionSupport.unregisterWindowListener(EXTENSION_NAME);
    for (let win of Services.wm.getEnumerator("mail:3pane")) {
      unpaint(win);
    }
  }
};

function paint(win) {
  win.ThunvatarApi = {};
  Services.scriptloader.loadSubScript(
    extension.getURL("content/customcol.js"),
    win.ThunvatarApi
  );
  win.ThunvatarApi.ThunvatarHeaderView.init(win);
}

function unpaint(win) {
  win.ThunvatarApi.ThunvatarHeaderView.destroy();
  delete win.ThunvatarApi;
}

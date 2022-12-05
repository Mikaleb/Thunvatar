// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.

"use strict";
let { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
let { ExtensionSupport } = ChromeUtils.import(
  "resource:///modules/ExtensionSupport.jsm"
);
let { ExtensionParent } = ChromeUtils.import(
  "resource://gre/modules/ExtensionParent.jsm"
);

const EXTENSION_NAME = "thunvatar@mikaleb.com";
let extension = ExtensionParent.GlobalManager.getExtension(EXTENSION_NAME);

// Implements the functions defined in the experiments section of schema.json.
let FAC = class extends ExtensionCommon.ExtensionAPI {
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
      FAC: {
        addWindowListener(dummy) {
          // Adds a listener to detect new windows.
          ExtensionSupport.registerWindowListener(EXTENSION_NAME, {
            chromeURLs: [
              "chrome://messenger/content/messenger.xul",
              "chrome://messenger/content/messenger.xhtml",
            ],
            onLoadWindow: paint,
            onUnloadWindow: destroyView,
          });
        },
      },
    };
  }

  close() {
    ExtensionSupport.unregisterWindowListener(EXTENSION_NAME);
    for (let win of Services.wm.getEnumerator("mail:3pane")) {
      destroyView(win);
    }
  }
};

function paint(win) {
  win.FAC = {};
  Services.scriptloader.loadSubScript(
    extension.getURL("customcol.js"),
    win.FAC
  );
  win.FAC.FACHeaderView.init(win);
}

function destroyView(win) {
  win.FAC.FACHeaderView.destroy();
  delete win.FAC;
}

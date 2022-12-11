let gCryptoHash = null;

function md5Hash(text) {
  // Lazily create a reusable hasher
  if (gCryptoHash === null) {
    gCryptoHash = Cc["@mozilla.org/security/hash;1"].createInstance(
      Ci.nsICryptoHash
    );
  }

  gCryptoHash.init(gCryptoHash.MD5);

  // Convert the text to a byte array for hashing
  gCryptoHash.update(
    text.split("").map((c) => c.charCodeAt(0)),
    text.length
  );

  // Request the has result as ASCII base64
  return gCryptoHash.finish(true);
}

class Gravatar {
  constructor() {
    this.email = "";
    this.size = 16;
  }

  getGravatarUrl() {
    // trimed and strtolower email
    const mailCleaned = this.email.trim().toLowerCase();
    return `https://www.gravatar.com/avatar/${md5Hash(mailCleaned)}?s=${
      this.size
    }`;
  }

  getGravatar(value) {
    this.email = value;
    return this.getGravatarUrl();
  }
}

// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.
let { AppConstants } = ChromeUtils.import(
  "resource://gre/modules/AppConstants.jsm"
);
let { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

const GRAVATAR = new Gravatar();

const jalaliDateColumnHandler = {
  init(win) {
    this.win = win;
  },
  getCellText(row, col) {
    return null;
  },
  getImageSrc(row, col) {
    var msgHdr = this.win.gDBView.getMsgHdrAt(row);
    const email = msgHdr.mime2DecodedAuthor.match(/<(.*)>/)[1];
    // get email address from header
    const emailAvatar = GRAVATAR.getGravatar(email);

    console.info("emailAvatar", emailAvatar);
    return emailAvatar;
  },

  getSortStringForRow(hdr) {
    return this.getJalaliDate(hdr);
  },
  isString() {
    return true;
  },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  getSortLongForRow(hdr) {
    return 0;
  },
  getJalaliDate(aHeader) {
    return aHeader.date / 1000;
  },
};

const columnOverlay = {
  init(win) {
    this.win = win;
    this.addColumns(win);
  },

  destroy() {
    this.destroyColumns();
  },

  observe(aMsgFolder, aTopic, aData) {
    try {
      jalaliDateColumnHandler.init(this.win);
      this.win.gDBView.addColumnHandler(
        "jalaliDateColumn",
        jalaliDateColumnHandler
      );
    } catch (ex) {
      console.error(ex);
      throw new Error("Cannot add column handler");
    }
  },

  addColumn(win, columnId, columnLabel) {
    if (win.document.getElementById(columnId)) return;

    const treeCol = win.document.createXULElement("treecol");
    treeCol.setAttribute("id", columnId);
    treeCol.setAttribute("persist", "hidden ordinal sortDirection width");
    treeCol.setAttribute("flex", "2");
    treeCol.setAttribute("closemenu", "none");
    treeCol.setAttribute("label", columnLabel);
    treeCol.setAttribute("tooltiptext", "Sort by Persian date");

    const threadCols = win.document.getElementById("threadCols");
    threadCols.appendChild(treeCol);

    // Restore persisted attributes.
    let attributes = Services.xulStore.getAttributeEnumerator(
      this.win.document.URL,
      columnId
    );
    for (let attribute of attributes) {
      let value = Services.xulStore.getValue(
        this.win.document.URL,
        columnId,
        attribute
      );
      // See Thunderbird bug 1607575 and bug 1612055.
      if (
        attribute != "ordinal" ||
        parseInt(AppConstants.MOZ_APP_VERSION, 10) < 74
      ) {
        treeCol.setAttribute(attribute, value);
      } else {
        treeCol.ordinal = value;
      }
    }

    Services.obs.addObserver(this, "MsgCreateDBView", false);
  },

  addColumns(win) {
    this.addColumn(win, "jalaliDateColumn", "Sender's avatar");
  },

  destroyColumn(columnId) {
    const treeCol = this.win.document.getElementById(columnId);
    if (!treeCol) return;
    treeCol.remove();
  },

  destroyColumns() {
    this.destroyColumn("jalaliDateColumn");
    Services.obs.removeObserver(this, "MsgCreateDBView");
  },
};

var MahourDateHeaderView = {
  init(win) {
    this.win = win;
    columnOverlay.init(win);

    // Usually the column handler is added when the window loads.
    // In our setup it's added later and we may miss the first notification.
    // So we fire one ourserves.
    if (
      win.gDBView &&
      win.document.documentElement.getAttribute("windowtype") == "mail:3pane"
    ) {
      Services.obs.notifyObservers(null, "MsgCreateDBView");
    }
  },

  destroy() {
    columnOverlay.destroy();
  },
};

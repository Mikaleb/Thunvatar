// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.
let { AppConstants } = ChromeUtils.import(
  "resource://gre/modules/AppConstants.jsm"
);
let { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

let MSG_VIEW_FLAG_DUMMY = 0x20000000;

const COLUMN_ID = "thunVatarCol";

// write a gravatar class
class Gravatar {
  getGravatar(email) {
    let hash = this.md5(email);
    return "https://www.gravatar.com/avatar/" + hash + "?d=404";
  }
}

class GravatarColumn extends Gravatar {
  constructor() {
    super();
  }

  getAddress(row) {
    let msgHdr = gDBView.getMsgHdrAt(row);
    let author = msgHdr.mime2DecodedAuthor;
    if (author) {
      let email = author.match(/<(.*)>/);
      if (email) {
        return getGravatar(email[1]);
      }
    }
    // first letter of author
    return getGravatar(author[0]);
  }
}

const senderColumnHandler = {
  init(win) {
    this.win = win;
  },
  getCellText(row) {
    let author = GravatarColumn.getAddress(row);
    return author.name || author.mailbox;
  },
  getSortStringForRow(hdr) {
    return GravatarColumn.getAddress(hdr);
  },
  isString() {
    return true;
  },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  getImageSrc(row, col) {
    return null;
  },
  getSortLongForRow(hdr) {
    return 0;
  },
  getAddress(aHeader) {
    return aHeader.author.replace(/.*</, "").replace(/>.*/, "");
  },
  isDummy(row) {
    return (this.win.gDBView.getFlagsAt(row) & MSG_VIEW_FLAG_DUMMY) != 0;
  },
};

const columnOverlay = {
  init(win) {
    this.win = win;
    this.addColumn(win, COLUMN_ID, "Avatar");
  },

  destroy() {
    this.destroyColumns();
  },

  observe(aMsgFolder, aTopic, aData) {
    try {
      senderColumnHandler.init(this.win);
      this.win.gDBView.addColumnHandler(COLUMN_ID, senderColumnHandler);
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
    treeCol.setAttribute("flex", "1");
    treeCol.setAttribute("closemenu", "none");
    treeCol.setAttribute("label", columnLabel);
    treeCol.setAttribute("tooltiptext", "Sort by author");
    treeCol.setAttribute("unthreaded", "true");
    treeCol.setAttribute("class", "sortDirectionIndicator");
    treeCol.setAttribute("sortActive", "true");
    treeCol.setAttribute("sortDirection", "ascending");
    treeCol.setAttribute("sortResource", "addrCol");
    treeCol.setAttribute("label", "From (+ Gravatar)");

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

  destroyColumn(columnId) {
    const treeCol = this.win.document.getElementById(columnId);
    if (!treeCol) return;
    treeCol.remove();
  },

  destroyColumns() {
    this.destroyColumn(COLUMN_ID);
    Services.obs.removeObserver(this, "MsgCreateDBView");
  },
};

let FACHeaderView = {
  init(win) {
    this.win = win;
    columnOverlay.init(win);

    // Usually the column handler is added when the window loads.
    // In our setup it's added later and we may miss the first notification.
    // So we fire one ourselves.
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

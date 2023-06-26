let gCryptoHash = null;

class AvatarFinder {
  constructor(email) {
    this.email = email;
    this.size = 16;
  }

  getDomainFromEmail() {
    let domain = '';
    // extract domain from email
    domain = this.email.match(/@(.*)/)[1];
    // check if domain is valid
    if (domain === undefined) {
      return '';
    }
    // split domain by dot
    domain = domain.split('.');
    // get last part of domain and extension
    domain = domain[domain.length - 2] + '.' + domain[domain.length - 1];

    return domain;
  }

  // getGravatarUrl() {
  //   // trimed and strtolower email
  //   const mailCleaned = this.email.trim().toLowerCase()
  //   return `https://www.gravatar.com/avatar/${md5Hash(mailCleaned)}?s=${
  //     this.size
  //   }`
  // }

  findFaviconFromDomain(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${this.size}`;
  }

  getAvatar() {
    const domain = this.getDomainFromEmail();
    return this.findFaviconFromDomain(domain);
  }
}

// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.
// @ts-ignore
let { AppConstants } = ChromeUtils.import(
  'resource://gre/modules/AppConstants.jsm'
);
// @ts-ignore
let Services = globalThis.Services || ChromeUtils.import(
  'resource://gre/modules/Services.jsm'
).Services;

const thunvatarDateColumnHandler = {
  init(win) {
    this.win = win;
  },
  getCellText(row, col) {
    return '';
  },
  getCellValue(row, col) {
    const msgHdr = this.win.gDBView.getMsgHdrAt(row);
    const email = msgHdr.mime2DecodedAuthor.match(/<(.*)>/)[1];
    const AVATAR_FINDER = new AvatarFinder(email);
    return AVATAR_FINDER.getDomainFromEmail();
  },
  getImageSrc(row, col) {
    const msgHdr = this.win.gDBView.getMsgHdrAt(row);
    const email = msgHdr.mime2DecodedAuthor.match(/<(.*)>/)[1];
    // get email address from header
    return new AvatarFinder(email).getAvatar();
  },

  getSortStringForRow(hdr) {
    const msgHdr = this.win.gDBView.getMsgHdrAt(row);
    return msgHdr.mime2DecodedAuthor;
  },
  isString() {
    return false;
  },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  // type: nsIMsgDBHdr
  // If the column displays a number, this will return the number that the column should be sorted by.
  getSortLongForRow(hdr) {
    const msgHdr = this.win.gDBView.getMsgHdrAt(row);
    return msgHdr.mime2DecodedAuthor;
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
      thunvatarDateColumnHandler.init(this.win);
      this.win.gDBView.addColumnHandler(
        'thunvatarDateColumn',
        thunvatarDateColumnHandler
      );
    } catch (ex) {
      console.error(ex);
      throw new Error('Cannot add column handler');
    }
  },

  addColumn(win, columnId, columnLabel) {
    if (win.document.getElementById(columnId)) return;

    const treeCol = win.document.createXULElement('treecol');
    treeCol.setAttribute('id', columnId);
    treeCol.setAttribute('persist', 'hidden ordinal sortDirection width');
    treeCol.setAttribute('flex', '2');
    treeCol.setAttribute('closemenu', 'none');
    treeCol.setAttribute('label', columnLabel);
    treeCol.setAttribute('tooltiptext', 'Sort by domain');

    const threadCols = win.document.getElementById('threadCols');
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
        attribute != 'ordinal' ||
        parseInt(AppConstants.MOZ_APP_VERSION, 10) < 74
      ) {
        treeCol.setAttribute(attribute, value);
      } else {
        treeCol.ordinal = value;
      }
    }

    Services.obs.addObserver(this, 'MsgCreateDBView', false);
  },

  addColumns(win) {
    this.addColumn(win, 'thunvatarDateColumn', 'Favicon');
  },

  destroyColumn(columnId) {
    const treeCol = this.win.document.getElementById(columnId);
    if (!treeCol) return;
    treeCol.remove();
  },

  destroyColumns() {
    this.destroyColumn('thunvatarDateColumn');
    Services.obs.removeObserver(this, 'MsgCreateDBView');
  },
};

var ThunvatarHeaderView = {
  init(win) {
    this.win = win;
    columnOverlay.init(win);

    // Usually the column handler is added when the window loads.
    // In our setup it's added later and we may miss the first notification.
    // So we fire one ourselves.
    if (
      win.gDBView &&
      win.document.documentElement.getAttribute('windowtype') == 'mail:3pane'
    ) {
      Services.obs.notifyObservers(null, 'MsgCreateDBView');
    }
  },

  destroy() {
    columnOverlay.destroy();
  },
};

if (!defaultPhotoURI) {
  var defaultPhotoURI = "chrome://messenger/skin/addressbook/icons/contact-generic.png";
}

const MAILBOX = 0
const NAME = 1
const FULL_NAME = 2

var columnHandler = {
  getCellText: function(row, col) {
    // TODO show the name from the address book if possible
    // TODO it is doing the work twice, rewrite to parseEmailHeader just once
    return this.getAuthorName(row) || this.getAuthorMailbox(row);
  },

  getImageSrc: function(row, col) {
    return this.photo(this.getAuthorMailbox(row));
  },

  getSortStringForRow: function(hdr) { return this.parseEmailsFromHeader(hdr.mime2DecodedAuthor, 'mailbox')[0]; },

  isString: function() { return true; },

  getCellProperties: function(row, col, props) { },

  getRowProperties: function(row, props) { },

  getSortLongForRow: function(hdr) { return 0; },


  // --- helper methods ---

  getAuthor: function(row) { return gDBView.getMsgHdrAt(row).mime2DecodedAuthor; },

  getAuthorName: function(row) { return this.parseEmailsFromHeader(this.getAuthor(row), NAME)[0] },

  getAuthorMailbox: function(row) { return this.parseEmailsFromHeader(this.getAuthor(row), MAILBOX)[0] },

  // header should be the value of to, from, or cc
  parseEmailsFromHeader: function(header, query) {
    const gHeaderParser = Cc["@mozilla.org/messenger/headerparser;1"].getService(Ci.nsIMsgHeaderParser);

    let mailboxes = {};
    let names = {};
    let fullNames = {};

    let numberOfParsedAddresses = gHeaderParser.parseHeadersWithArray(header, mailboxes, names, fullNames);

    if (query === NAME) {
      return names.value;
    } else if (query === FULL_NAME) {
      return fullNames.value;
    } else if (query == MAILBOX) {
      return mailboxes.value;
    }
  },

  addressBookPicture: function(email) {
    return null; // NOT IMPLEMENTED YET

    // .. FIXME figure out how to grab all address books
    let card = collection.cardForEmailAddress(email);
    if (card == null) {
      return null;
    }
    // FIXME return a photo if there is one
  },

  photo: function(email) {
    return this.addressBookPicture(email) || this.gravatar(email);
  },

  gravatar: function(email) {
    let hash = GlodaUtils.md5HashString(email.toLowerCase().trim());
    photoURI = "http://www.gravatar.com/avatar/" + encodeURIComponent(hash) + '?s=16&d=identicon';
    return photoURI;
  }
}




window.addEventListener("load", loadGravatars, false);

function loadGravatars() {
  window.removeEventListener("load", loadGravatars, false); // remove listener, no longer needed

  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
}

var CreateDbObserver = {
  observe: function(aMsgFolder, aTopic, aData) {
     addCustomColumnHandler();
  }
}

function addCustomColumnHandler() {
   gDBView.addColumnHandler("colGravatar", columnHandler);
}

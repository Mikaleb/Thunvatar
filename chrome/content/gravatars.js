if (!defaultPhotoURI) {
  var defaultPhotoURI = "chrome://messenger/skin/addressbook/icons/contact-generic.png";
}

var columnHandler = {
  getCellText: function(row, col) {
    // return this.getAuthorEmail(row);
    return null;
  },

  getImageSrc: function(row, col) {
    return this.photo(this.getAuthorEmail(row));
  },

  getSortStringForRow: function(hdr) { return hdr.mime2DecodedAuthor; },

  isString: function() { return true; },

  getCellProperties: function(row, col, props) { },

  getRowProperties: function(row, props) { },

  getSortLongForRow: function(hdr) { return 0; },


  // --- helper methods ---

  getAuthor: function(row) { return gDBView.getMsgHdrAt(row).mime2DecodedAuthor; },

  getAuthorEmail: function(row) { return this.emailsFromHeader(this.getAuthor(row))[0] },

  // header should be the value of to, from, or cc
  emailsFromHeader: function(header) {
    const gHeaderParser = Cc["@mozilla.org/messenger/headerparser;1"].getService(Ci.nsIMsgHeaderParser);

    let emails = {};
    let fullNames = {};
    let names = {};
    let numberOfParsedAddresses = gHeaderParser.parseHeadersWithArray(header, emails, names, fullNames);
    return emails.value;
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

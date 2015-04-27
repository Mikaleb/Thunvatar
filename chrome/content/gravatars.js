// a namespace for this add-on
if (typeof gravatars == "undefined") {
  var gravatars = {};
};

if (!defaultPhotoURI) {
  var defaultPhotoURI = "chrome://messenger/skin/addressbook/icons/contact-generic.png";
}

const MAILBOX = 0
const NAME = 1
const FULL_NAME = 2

gravatars.columnHandler = {
  getCellText: function(row, col) {
    // TODO show the name from the address book if possible
    // TODO it is doing the work twice, rewrite to parseEmailHeader just once
    return gravatars.getAuthorName(row) || gravatars.getAuthorMailbox(row);
  },

  getImageSrc: function(row, col) {
    return gravatars.photo(gravatars.getAuthorMailbox(row));
  },

  getSortStringForRow: function(hdr) { return gravatars.parseEmailsFromHeader(hdr.mime2DecodedAuthor, 'mailbox')[0]; },

  isString: function() { return true; },

  getCellProperties: function(row, col, props) { },

  getRowProperties: function(row, props) { },

  getSortLongForRow: function(hdr) { return 0; },
}

gravatars.getAuthor = function(row) {
  return gDBView.getMsgHdrAt(row).mime2DecodedAuthor;
}

gravatars.getAuthorName = function(row) {
  return gravatars.parseEmailsFromHeader(gravatars.getAuthor(row), NAME)[0]
}

gravatars.getAuthorMailbox = function(row) {
  return gravatars.parseEmailsFromHeader(gravatars.getAuthor(row), MAILBOX)[0]
}

  // header should be the value of to, from, or cc
gravatars.parseEmailsFromHeader = function(header, query) {
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
}

gravatars.addressBookPicture = function(email) {
  return null; // NOT IMPLEMENTED YET

  // .. FIXME figure out how to grab all address books
  let card = collection.cardForEmailAddress(email);
  if (card == null) {
    return null;
  }
  // FIXME return a photo if there is one
}

gravatars.photo = function(email) {
  return gravatars.addressBookPicture(email) || gravatars.gravatar(email);
}

gravatars.gravatar = function(email) {
  let hash = GlodaUtils.md5HashString(email.toLowerCase().trim());
  photoURI = "http://www.gravatar.com/avatar/" + encodeURIComponent(hash) + '?s=16&d=identicon';
  return photoURI;
}


gravatars.init = function() {
  var ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(gravatars.CreateDbObserver, "MsgCreateDBView", false);
}

gravatars.CreateDbObserver = {
  observe: function(aMsgFolder, aTopic, aData) {
     gravatars.addCustomColumnHandler();
  }
}

gravatars.addCustomColumnHandler = function() {
   gDBView.addColumnHandler("colGravatar", gravatars.columnHandler);
}


window.addEventListener("load", function initGravatars(event) {
    // remove listener, no longer needed
    window.removeEventListener("load", initGravatars, false);
    // do the real initialization
    gravatars.init()
},false);

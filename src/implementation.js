var ThreadPaneColumns;
try {
  ({ ThreadPaneColumns } = ChromeUtils.importESModule(
    'chrome://messenger/content/thread-pane-columns.mjs',
  ));
} catch (err) {
  ({ ThreadPaneColumns } = ChromeUtils.importESModule(
    'chrome://messenger/content/ThreadPaneColumns.mjs',
  ));
}

const ids = [];

var customColumns = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      customColumns: {
        async add(id, name, field) {
          ids.push(id);

          const initiallyHidden = field.search(/domain/i) !== -1;

          const callbacks = {
            thunvatar: function (message) {
              return JSON.stringify(ThreadPaneColumns);
            },
          };

          function getImageId(hdr, column) {
            console.debug('🚀 ~ extends ~ getImageId ~ column:', column);

            // const msgHdr = this.win.gDBView.getMsgHdrAt(row);
            // const email = msgHdr.mime2DecodedAuthor.match(/<(.*)>/)[1];
            // // get email address from header
            // return new AvatarFinder(email).getAvatar();

            return 'https://fastly.picsum.photos/id/43/64/64.jpg?hmac=MVlWNavh4VkaxfIlWUcb2xnJZ_8IYYlDX880wZd5g5M';
          }

          ThreadPaneColumns.addCustomColumn(id, {
            name: name,
            hidden: initiallyHidden,
            icon: true,
            // iconCallback: (hdr) => getImageId(hdr, column),
            iconCallback: (hdr) => {
              return 'getImageId';
            },
            iconCellDefinitions: [
              {
                id: 'getImageId',
                alt: '+',
                title: 'Image ID',
                // url: getExtensionUrl('/images/score_positive.png'),
                url: 'https://fastly.picsum.photos/id/43/64/64.jpg?hmac=MVlWNavh4VkaxfIlWUcb2xnJZ_8IYYlDX880wZd5g5M',
              },
            ],
            iconHeaderUrl:
              'https://fastly.picsum.photos/id/893/32/32.jpg?hmac=0xC7u8QkcoFxQSe32WIJr3syjpen03KWo1-woj59kO4',
            // iconHeaderUrl: extension.getURL('images/' + column + '.svg'),
            resizable: true,
            sortable: true,
            textCallback: true,
          });
        },

        async remove(id) {
          ThreadPaneColumns.removeCustomColumn(id);
          ids.remove(id);
        },
      },
    };
  }

  close() {
    for (const id of ids) {
      ThreadPaneColumns.removeCustomColumn(id);
    }
  }
};

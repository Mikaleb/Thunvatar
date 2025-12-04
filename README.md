# Thunvatar

A simple add-on for Mozilla Thunderbird that adds a favicon to emails.

<a href="https://www.producthunt.com/posts/thunvatar?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-thunvatar" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=373192&theme=light" alt="Thunvatar&#0032; - Add&#0032;a&#0032;favicon&#0032;to&#0032;thunderbird&#0039;s&#0032;mails | Product Hunt" style="width: 150px; height: 54px;" width="150" height="54" /></a>

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Getting Started

Thunvatar is a simple add-on that requires no configuration. Once installed, it will automatically add a favicon to every email in your Thunderbird inbox.

### Manual Install

If you want to try the latest version of Thunvatar before it's released on the official Mozilla Add-ons store, you can install it manually:

1. **Build from source**:
   - Clone the [Thunvatar repository](https://github.com/Mikaleb/thunvatar)
   - Run `zip -r thunvatar.xpi *` in the `src` directory to build the xpi file
   - Install it from the `Add-ons Manager` page in Thunderbird
2. **Install from Mozilla Add-ons store**: Once Thunvatar is released on the official Mozilla Add-ons store, you can install it directly from there.

## Technical Details

Thunvatar uses the following technologies:

- [Mozilla Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK)
- [Thunderbird XPCOM APIs](http://udn.realityripple.com/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsITreeView)

## Contribute

Contributions to Thunvatar are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

## Credits

- Mikaleb - Creator of Thunvatar

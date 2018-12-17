BitProton Cold Wallet
=======
**NOTE:** This is a beta software. It's not well tested and reviewed by others. Don't use it other than experimenting with little amounts for now.

Cold Wallet is a transaction signing tool for Bitcoin SV. It enables to sign transactions with given keys on a clean GUI. Offline usage is recommended.

![BitProton Cold Wallet Screenshot](https://raw.githubusercontent.com/bitproton/coldwallet/master/assets/screenshot.png)

## Motivation

Spending from paper/metal wallets without exposing keys to an online environment is cumbersome. This tool make easier to spend from paper/metal wallets with the coordination of a watchonly wallet or a web service like [BitProton](https://bitproton.com). 

Watchonly wallet is used for creating unsigned transactions on an online device and this is used for signing transactions on an offline device. This will let users prepare unsigned transactions easily via a web interface and sign them offline, then broadcast it again via the web interface.

Using QR codes for transferring the data between offline and online device guarantees the keys don't touch to an online environment. [ThruGlassXfer](http://thruglassxfer.com/#Look) support will be added.

## Download

Available only for Windows at the moment:

https://github.com/bitproton/coldwallet/releases/

## Build with Electron

```
git clone https://github.com/bitproton/coldwallet.git
cd coldwallet
npm install
npm install -g electron
npm install -g electron-builder
electron-builder build
```

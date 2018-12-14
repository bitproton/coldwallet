define(
    [
        'js/Organizator/Organizator/Application'
    ],
    function(
        Organizator_Application
    ){
        class MyApp extends Organizator_Application {
            constructor(){
                super('MyApp');

                this.name = 'BitProton Cold Wallet';
                this.BTC_TO_SATOSHI = 100000000;
                
                console.log('DISCLAIMER' +
                            '\n==========' +
                            '\n\nUse developer tools at your own risk.' +
                            '\n\nIt is possible to lost all of your keys if you do a mistake.' +
                            '\n\nSensitive data are stored at:' +
                            '\n\nlocalStorage / Organizator.PersistentDb (encrypted, persistent)' +
                            '\nOrganizator.applications.Auth (decrypted for 5 minutes after unlocking the wallet, non-persistent)' +
                            "\n\nStanford Javascript Crypto Library (http://bitwiseshiftleft.github.io/sjcl/) is used for encryption" +
                            "\n\n"
                            );
            }

            static toSatoshi(value){
                return value * this.BTC_TO_SATOSHI;
            }

            static satoshiToBtc(value){
                return value / this.BTC_TO_SATOSHI;
            }
        }
        
        return MyApp;
    }
);
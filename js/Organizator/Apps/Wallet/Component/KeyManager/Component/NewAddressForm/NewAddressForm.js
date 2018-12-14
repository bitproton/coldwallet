define(
    [
        'js/Organizator/Apps/FormStd/FormStd',
        'js/Organizator/Apps/SelectElementProxy/SelectElementProxy',
        './Component/MultisigKeysFieldsetCollection/MultisigKeysFieldsetCollection',
        'js/node_modules/bitcoincashjs-lib/dist/bitcoincashjs-lib.min',
        'text!./Resources/view/typeproxy-front-option.html.njk',
        'text!js/Organizator/Apps/Wallet/Resources/view/address-card.html.njk',
        'js/Organizator/Component/Validation/Constraint/NotBlank',
        'js/Organizator/Component/Validation/Constraint/Length',
        'js/Organizator/src/Constraint/BitcoinAddress',
        'js/Organizator/src/Constraint/BitcoinPrivateKey',
        'js/Organizator/src/Constraint/MultisigKeyCount'
    ],
    function(
        FormStd,
        SelectElementProxy,
        MultisigKeysFieldsetCollection,
        bitcoinjs,
        tpl_typeProxyFrontOption,
        tpl_addressCard
    ){
        class NewAddressForm {
            constructor(container){
                this.formName = 'wallet_new_address';
                this.form = container.querySelector('form[name="' + this.formName + '"]');

                this.formController = new FormStd(this.form, this.formName, {
                    validationMode: ['onInputChange', 'onInputBlur', 'onSubmit'],
                    isXMLHttpRequest: false,
                    isRequest: false,
                    hideBlankFieldErrors: false,
                    onFormSuccess: this.onFormSuccess.bind(this)
                });

                //this.MultisigKeysFieldsetCollection = new MultisigKeysFieldsetCollection(this.form.querySelector('.multisigKeysFieldsetCollection'));


                this.field_label = this.form.querySelector('[name="' + this.formName + '[label]"]');
                this.field_privatekey = this.form.querySelector('[name="' + this.formName + '[privatekey]"]');
                this.field_address = this.form.querySelector('[name="' + this.formName + '[address]"]');
                //this.field_segwitaddress = this.form.querySelector('[name="' + this.formName + '[segwitaddress]"]');
                //this.field_multisigaddress = this.form.querySelector('[name="' + this.formName + '[multisigaddress]"]');
                //this.field_multisigkeys = this.form.querySelectorAll('[name^="' + this.formName + '[multisigkeys]"]');
                //this.field_reqkeycount = this.form.querySelector('[name="' + this.formName + '[reqkeycount]"]');
                //this.fieldset_multisigkeys = this.form.querySelector('.multisigKeysFieldsetCollection');

                //this.typeSelectElementProxyElement = this.form.querySelector('.js__typeSelectElementProxy');
                //this.typeSelectElementProxiedElement = this.form.querySelector('#' + this.typeSelectElementProxyElement.getAttribute('for'));
                //this.typeSelectElementProxy = new SelectElementProxy(this.formName + '_type', this.typeSelectElementProxyElement, this.typeSelectElementProxiedElement, this.selectElementProxyUpdateFront.bind(this));

                this.bindEvents();
            }

            refresh(){
                this.refreshElements();
                this.rebindEvents();
            }

            refreshElements(){
                //his.field_multisigkeys = this.form.querySelectorAll('[name^="wallet_new_address[multisigkeys]"]');
            }

            createRebindableEvents(){
                //this.multisigKeysChanged = this.multisigKeysChanged.bind(this);
            }

            bindEvents(){
                this.createRebindableEvents();

                //this.typeSelectElementProxiedElement.addEventListener('input', this.typeChanged.bind(this));
                this.field_privatekey.addEventListener('input', this.privateKeyChanged.bind(this));
                //[
                //    ...this.field_multisigkeys,
                //    ...[this.field_reqkeycount]
                //].forEach(element => element.addEventListener('input', this.multisigKeysChanged));
            }

            rebindEvents(){
                var self = this;

                //this.field_multisigkeys.forEach(function(element){
                //    element.removeEventListener('input', self.multisigKeysChanged);
                //    element.addEventListener('input', self.multisigKeysChanged);
                //});
            }

            typeChanged(event){
                this.field_privatekey.parents('.js__formGroup')[0].classList.remove('hide');
                //this.field_segwitaddress.parents('.js__formGroup')[0].classList.add('hide');
                //this.field_multisigaddress.parents('.js__formGroup')[0].classList.add('hide');
                //this.fieldset_multisigkeys.classList.add('hide');
                //this.field_reqkeycount.parents('.js__formGroup')[0].classList.add('hide');
                this.field_address.parents('.js__formGroup')[0].classList.remove('hide');

                this.field_privatekey.removeAttribute('org-novalidate');
                //this.field_reqkeycount.setAttribute('org-novalidate', '');
                //for(let element of this.field_multisigkeys){
                //    element.setAttribute('org-novalidate', '');
                //}
            }

            onFormSuccess(){
                var existingKeypairObject = Organizator.PersistentDb.getCollection('key').findOne({
                    type: 'legacy',
                    address: this.field_address.value,
                });

                if(existingKeypairObject !== null){
                    return;
                }

                var keypair = bitcoinjs.ECPair.fromWIF(this.field_privatekey.value);
                var publickey = keypair.getPublicKeyBuffer();
                var address = keypair.getAddress();
                //var redeemScript = bitcoinjs.script.witnessPubKeyHash.output.encode(bitcoinjs.crypto.hash160(publickey));
                //var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
                // var segwitAddress = bitcoinjs.address.fromOutputScript(scriptPubKey);

                var keypairObject = {
                    type: 'legacy',
                    label: this.field_label.value,
                    privatekey: sjcl.encrypt(Organizator.applications.Auth.password, this.field_privatekey.value),
                    publickey: publickey,
                    realaddress: address,
                    address: address,
                    // segwitaddress: segwitAddress
                }
                    
                var lokiObject = Organizator.PersistentDb.getCollection('key').insert(keypairObject);
                Organizator.PersistentDb.saveDatabase();

                var content = Organizator.Nunjucks.renderString(tpl_addressCard, {
                    address: lokiObject
                });
                Organizator.applications.Wallet.AddressCollection.add(content, 'afterbegin');
                Organizator.applications.ModalManager.remove(Organizator.applications.Wallet.KeyManager.modal, true);
            }

            selectElementProxyUpdateFront(){
                //let selectedOptions = this.typeSelectElementProxy.targetElement.querySelectorAll('option:checked');

                //this.typeSelectElementProxy.front.innerHTML = Organizator.Nunjucks.renderString(tpl_typeProxyFrontOption, {
                //    value: selectedOptions[0].innerText
                //});
            };

            privateKeyChanged(event){
                event.preventDefault();

                let privateKey = this.field_privatekey.value;
                let keyPair = bitcoinjs.ECPair.fromWIF(privateKey);
                let publicKey = keyPair.getPublicKeyBuffer();
                let address = keyPair.getAddress();
                //let redeemScript = bitcoinjs.script.witnessPubKeyHash.output.encode(bitcoinjs.crypto.hash160(publicKey));
                //let scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
                //let segwitAddress = bitcoinjs.address.fromOutputScript(scriptPubKey);

                this.field_address.value = address;
                //this.field_segwitaddress.value = segwitAddress;

                this.field_address.dispatchEvent(new Event('input'));
                //this.field_segwitaddress.dispatchEvent(new Event('input'));
                // this.binaryPreviewContainerElement.innerHTML = this.stringToBinary(privateKey, ' ');
            }

            multisigKeysChanged(event){
                event.preventDefault();
                let element = event.currentTarget;

                if(!Organizator.Validator.validateHTMLElement(element).isValid){
                    this.field_multisigaddress.value = '';
                }else{
                    var keyPairs = Array.from(this.field_multisigkeys).map(function(element){
                        return bitcoinjs.ECPair.fromWIF(element.value);
                    });

                    var pubKeys = keyPairs.map(function(keypair){
                        return keypair.getPublicKeyBuffer();
                    });

                    // 2-of-4 example 
                    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/c3eefbef61ca77cef1cdcc1a197f24b51abe39b4/test/integration/transactions.js#L99-L137
                    var redeemScript = bitcoinjs.script.multisig.output.encode(parseInt(this.field_reqkeycount.value) || 1, pubKeys);
                    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
                    var multisigAddress = bitcoinjs.address.fromOutputScript(scriptPubKey);

                    this.field_multisigaddress.value = multisigAddress;
                }
            }
        }
        
        return NewAddressForm;
    }
);
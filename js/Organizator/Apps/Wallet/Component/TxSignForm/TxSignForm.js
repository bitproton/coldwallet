define(
    [
        'js/Organizator/Apps/FormStd/FormStd',
        './Component/Steps/Steps',
        'js/node_modules/bitcoincashjs-lib/dist/bitcoincashjs-lib.min',
        'text!./Resources/view/tx-preview.html.njk',
        'text!./Resources/view/tx-preview-blank.html.njk',
        'text!js/Organizator/Apps/Wallet/Resources/view/transactions.html.njk',
        'css!./Resources/css/style',
        'js/Organizator/Component/Validation/Constraint/NotBlank',
        'js/Organizator/Component/Validation/Constraint/Checked',
        'js/Organizator/src/Constraint/RawTransactionHex'
    ],
    function(
        FormStd,
        Steps,
        bitcoinjs,
        tpl_txPreview,
        tpl_txPreviewBlank,
        tpl_transactions
    ){
        class TxSignForm {
            constructor(modal){
                this.modal = modal;
                this.formName = 'tx_sign';
                this.form = this.modal.element.querySelector('form[name="' + this.formName + '"]');
                this.field_txbodyunsigned = this.form.querySelector('[name="' + this.formName + '[txbodyunsigned]"]');
                this.field_txmeta = this.form.querySelector('[name="' + this.formName + '[txmeta]"]');
                this.txPreviewContainer = this.form.querySelector('.txPreviewContainer');
                this.textareaActionButtons = this.form.querySelectorAll('.textareaContainer [data-cmd]');
                this.checkboxes = this.form.querySelectorAll('.userCheckList [type="checkbox"]');
                
                this.completeForm = this.modal.element.querySelector('form[name="tx_complete"]');
                this.completeFormTxPreviewContainer = this.completeForm.querySelector('.txPreviewContainer');
                this.completeForm_field_txbodysigned = this.completeForm.querySelector('[name="tx_complete[txbodysigned]"]');
                this.completeFormCheckboxes = this.completeForm.querySelectorAll('.userCheckList [type="checkbox"]');
                this.completeFormTextareaActionButtons = this.completeForm.querySelectorAll('.textareaContainer [data-cmd]');

                this.Steps = new Steps(this.modal.element);
                this.formController = new FormStd(this.form, this.formName, {
                    validationMode: ['onInputChange', 'onInputBlur', 'onSubmit'],
                    isRequest: false,
                    hideBlankFieldErrors: false,
                    onFormSuccess: this.onFormSuccess.bind(this)
                });

                this.bindEvents();
            }

            bindEvents(){
                var self = this;
                
                [
                    this.field_txbodyunsigned,
                    this.field_txmeta
                ].forEach(function(element){
                    element.addEventListener('input', self.txChanged.bind(self));
                });

                this.checkboxes.forEach(element => element.addEventListener('click', this.checkboxClicked.bind(this)));
                this.completeFormCheckboxes.forEach(element => element.addEventListener('click', this.checkboxClicked.bind(this)));
            
                this.textareaActionButtons.forEach(element => element.addEventListener('click', Organizator.applications.TextareaTools.textareaActionButtonClicked.bind(Organizator.applications.TextareaTools)));
                this.completeFormTextareaActionButtons.forEach(element => element.addEventListener('click', Organizator.applications.TextareaTools.textareaActionButtonClicked.bind(Organizator.applications.TextareaTools)));
            }

            checkboxClicked(event){
                let element = event.currentTarget;
                let checkListItem = element.parents('li')[0];

                if(element.checked){
                    checkListItem.classList.add('completed');
                }else{
                    checkListItem.classList.remove('completed');
                }
            }

            clearPreview(){
                let txPreview = Organizator.Nunjucks.renderString(tpl_txPreviewBlank);

                this.txPreviewContainer.innerHTML = txPreview;
                this.completeFormTxPreviewContainer.innerHTML = txPreview;
            }

            txChanged(event){
                event.preventDefault();

                let txbodyunsigned = this.field_txbodyunsigned.value.trim();
                let txmeta = this.field_txmeta.value.trim();

                if((txbodyunsigned == '' || txbodyunsigned == null) || (txmeta == '' || txmeta == null)){
                    this.clearPreview();

                    return;
                }

                try{
                    var tx = new bitcoinjs.Transaction.fromHex(txbodyunsigned);
                    txmeta = JSON.parse(txmeta);
                }catch(e){
                    this.clearPreview();

                    return;
                }

                let txb = new bitcoinjs.TransactionBuilder.fromTransaction(tx);

                let i = 0;
                for(let input of txb.tx.ins){
                    let txid = input.hash.reverse().toString('hex');
                    input.hash.reverse();
                    let index = input.index;
                    let inputMeta = txmeta.filter(function(item){
                        return item.txid == txid && item.vout == index;
                    })[0];

                    txb.tx.setInputScript(i, bitcoinjs.script.fromASM(inputMeta.scriptPubKey));
                    i++;
                }

                let transaction = this.txToJson(txb.tx, txmeta);
                transaction = this.hydrateToView(transaction);

                let txPreview = Organizator.Nunjucks.renderString(tpl_txPreview, {
                    transaction: transaction
                });

                this.txPreviewContainer.innerHTML = txPreview;
                this.completeFormTxPreviewContainer.innerHTML = txPreview;
            }

            onFormSuccess(){
                let txbodyunsigned = this.field_txbodyunsigned.value;
                let txmeta = this.field_txmeta.value;
                txmeta = JSON.parse(txmeta);
                let tx = new bitcoinjs.Transaction.fromHex(txbodyunsigned);
                let txb = new bitcoinjs.TransactionBuilder.fromTransaction(tx);

                window.txb = txb;

                let i = 0;
                for(let input of txb.tx.ins){
                    let txid = input.hash.reverse().toString('hex');
                    /* 
                     * [NOTEID:1]
                     * No good solution is found to reverse a typed array without modifying the original one.
                     * input.hash.slice().reverse() seems not working as expected on Chrome.
                     * So rereverse is needed.
                     */
                    input.hash.reverse(); 
                    let index = input.index;
                    let inputMeta = txmeta.filter(function(item){
                        return item.txid == txid && item.vout == index;
                    })[0];
                    let type = bitcoinjs.script.classifyOutput(bitcoinjs.script.fromASM(inputMeta.scriptPubKey));
                    
                    txb.tx.setInputScript(i, bitcoinjs.script.fromASM(inputMeta.scriptPubKey));

                    switch(type){
                        case 'pubkey':
                            var pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(inputMeta.scriptPubKey))[0]);
                            var address = pubKey.getAddress();
                            break;
                        case 'pubkeyhash':
                        case 'scripthash':
                            var address = bitcoinjs.address.fromOutputScript(bitcoinjs.script.fromASM(inputMeta.scriptPubKey)).toString();
                            break;
                    }

                    let _keyPair = Organizator.PersistentDb.getCollection('key').findOne({
                        realaddress: address
                    });

                    if(_keyPair !== undefined && _keyPair !== null){
                        try{
                            switch(_keyPair.type){
                                case 'legacy':
                                    var hashType = bitcoinjs.Transaction.SIGHASH_ALL | bitcoinjs.Transaction.SIGHASH_BITCOINCASHBIP143;
                                    var keyPair = bitcoinjs.ECPair.fromWIF(sjcl.decrypt(Organizator.applications.Auth.password, _keyPair.privatekey));
                                    txb.sign(i, keyPair, null, hashType, parseInt(inputMeta.amount));
                                break;
                                case 'segwit':
                                    var keyPair = bitcoinjs.ECPair.fromWIF(sjcl.decrypt(Organizator.applications.Auth.password, _keyPair.privatekey));
                                    var pubKey = keyPair.getPublicKeyBuffer();
                                    var pubKeyHash = bitcoinjs.crypto.hash160(pubKey);
                                    var redeemScript = bitcoinjs.script.witnessPubKeyHash.output.encode(pubKeyHash);
                                    var redeemScriptHash = bitcoinjs.crypto.hash160(redeemScript);
                                    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(redeemScriptHash);
                                    
                                    txb.sign(i, keyPair, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL, parseInt(inputMeta.amount));
                                break;
                                case 'multisig':
                                    var keyPairs = _keyPair.privatekeys.map(function(privatekey){
                                        return bitcoinjs.ECPair.fromWIF(sjcl.decrypt(Organizator.applications.Auth.password, privatekey));
                                    });

                                    var pubKeys = keyPairs.map(function(keypair){
                                        return keypair.getPublicKeyBuffer();
                                    });

                                    // p2wsh multisig example. this doesn't work for normal multisig.
                                    // this is for p2wsh instead of p2sh.
                                    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/c3eefbef61ca77cef1cdcc1a197f24b51abe39b4/test/integration/transactions.js#L175
                                    /*
                                    var witnessScript = bitcoinjs.script.multisig.output.encode(parseInt(_keyPair.reqkeycount), pubKeys);
                                    var witnessScriptHash = bitcoinjs.crypto.sha256(witnessScript);
                                    var redeemScript = bitcoinjs.script.witnessScriptHash.output.encode(witnessScriptHash);
                                    var redeemScriptHash = bitcoinjs.crypto.hash160(redeemScript);
                                    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(redeemScriptHash);
                                    var multisigAddress = bitcoinjs.address.fromOutputScript(scriptPubKey);
                                    */
                                    
                                    // 2-of-4 example 
                                    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/c3eefbef61ca77cef1cdcc1a197f24b51abe39b4/test/integration/transactions.js#L99-L137
                                    var redeemScript = bitcoinjs.script.multisig.output.encode(parseInt(_keyPair.reqkeycount) || 1, pubKeys);
                                    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
                                    var multisigAddress = bitcoinjs.address.fromOutputScript(scriptPubKey);

                                    var n = 0;
                                    for(let keyPair of keyPairs){
                                        if(n >= _keyPair.reqkeycount){break;}
                                        txb.sign(i, keyPair, redeemScript);
                                        n++;
                                    }
                                break;
                            }
                        }catch(e){
                            alert(e);
                            return false;
                        }
                    }else{
                        alert('No key pair was found to sign this transaction.');
                        return false; // No key pair
                    }

                    i++;
                }

                let txbb = txb.build();

                this.completeForm_field_txbodysigned.value = txbb.toHex();
                this.Steps.jumpToStep('complete');

                let txview = this.hydrateToView(this.txToJson(txb.tx, txmeta));
                txview.time = Math.round((new Date().getTime()) / 1000);
                txview.txid = txb.tx.getId();

                let content = Organizator.Nunjucks.renderString(tpl_transactions, {
                    transactions: [txview]
                });

                let txObject = {};
                txObject.time = txview.time;
                txObject.txid = txview.txid;
                txObject.txbodyunsigned = txbodyunsigned;
                txObject.txmeta = txmeta;
                txObject.totalSpent = txview.totalSpent;

                let transactions = Organizator.PersistentDb.getCollection('transaction');
                
                if(transactions.findOne({txid: txObject.txid}) === null){
                    transactions.insert(txObject);
                    Organizator.PersistentDb.saveDatabase();

                    Organizator.applications.Wallet.txCollection.insertAdjacentHTML('afterbegin', content);
                    Organizator.applications.Wallet.txCollection.classList.remove('hide');
                    Organizator.applications.Wallet.transactionsSectionIfEmpty.classList.add('hide');
                    
                    Organizator.applications.Wallet.refresh();
                }
            }

            decodeFormat(tx){
                var result = {
                    txid: tx.getId(),
                    version: tx.version,
                    locktime: tx.locktime,
                };

                return result;
            }

            decodeInput(tx, txmeta){
                var result = [];

                tx.ins.forEach(function(input, n){
                    var vin = {
                        txid: input.hash.reverse().toString('hex'),
                        n : input.index,
                        script: bitcoinjs.script.toASM(input.script),
                        sequence: input.sequence,
                        scriptPubKey: {
                            asm: bitcoinjs.script.toASM(input.script),
                            hex: input.script.toString('hex'),
                            type: bitcoinjs.script.classifyOutput(input.script),
                            addresses: [],
                        }
                    }

                    input.hash.reverse(); // Find NOTEID:1 on this file 

                    switch(vin.scriptPubKey.type){
                        case 'pubkey':
                            let pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(vin.scriptPubKey.asm))[0]);
                            
                            vin.scriptPubKey.addresses.push(pubKey.getAddress());
                            break;
                        case 'pubkeyhash':
                        case 'scripthash':
                            vin.scriptPubKey.addresses.push(bitcoinjs.address.fromOutputScript(input.script));
                            break;
                    }

                    if(typeof txmeta !== 'undefined'){
                        vin.value = txmeta.filter(function(item){
                            return item.txid == vin.txid && item.vout == vin.n
                        })[0].amount;
                    }

                    result.push(vin);
                });

                return result
            }

            decodeOutput(tx, network){
                var format = function(out, n, network){
                    var vout = {
                        value: out.value,
                        n: n,
                        scriptPubKey: {
                            asm: bitcoinjs.script.toASM(out.script),
                            hex: out.script.toString('hex'),
                            type: bitcoinjs.script.classifyOutput(out.script),
                            addresses: [],
                        },
                    };

                    switch(vout.scriptPubKey.type){
                        case 'pubkey':
                            let pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(out.scriptPubKey.asm))[0]);
                            
                            out.scriptPubKey.addresses.push(pubKey.getAddress());
                            break;
                        case 'pubkeyhash':
                        case 'scripthash':
                            vout.scriptPubKey.addresses.push(bitcoinjs.address.fromOutputScript(out.script, network));
                            break;
                    }
                    return vout
                }

                var result = [];

                tx.outs.forEach(function(out, n){
                    result.push(format(out, n, network));
                })

                return result
            }

            txHexToJson(hex, txmetaHex){
                let tx = bitcoinjs.Transaction.fromHex(hex);
                
                if(typeof txmetaHex !== 'undefined'){
                    var txmeta = JSON.parse(this.hexToString(txmetaHex));
                } 

                return this.txToJson(tx, txmeta);
            }

            txToJson(tx, txmeta){
                return {
                    format: this.decodeFormat(tx),
                    vin: this.decodeInput(tx, txmeta),
                    vout: this.decodeOutput(tx)
                }
            }

            hexToString(hex){
                var string = '';

                for (var i = 0; i < hex.length; i += 2) {
                  string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }

                return string;
            }

            hydrateToView(transaction){
                transaction.fee = 0;
                transaction.totalSpent = 0;
                
                for(let input of transaction.vin){
                    input.flags = [];

                    transaction.fee += parseInt(input.value);
                    transaction.totalSpent -= parseInt(input.value);

                    let addressSuccessCount = 0;
                    for(let address of input.scriptPubKey.addresses){
                        let keyPair = Organizator.PersistentDb.getCollection('key').findOne({
                            realaddress: address
                        });

                        if(keyPair !== undefined && keyPair !== null){
                            addressSuccessCount++;
                        }
                    }

                    input.flags = (addressSuccessCount === input.scriptPubKey.addresses.length) ? ['canSign'] : ['cantSign'];
                }

                for(let output of transaction.vout){
                    transaction.fee -= parseInt(output.value);
                    output.flags = [];

                    for(let address of output.scriptPubKey.addresses){
                        for(let input of transaction.vin){
                            if(input.scriptPubKey.addresses.indexOf(address) !== -1){
                                output.flags = ['change'];
                            }
                        }
                    }

                    if(output.flags.indexOf('change') !== -1){
                        transaction.totalSpent += parseInt(output.value);
                    }
                }

                transaction.signable = transaction.vin.filter(function(input){return input.flags.indexOf('cantSign') !== -1}).length == 0 ? true : false;

                return transaction;
            }
        }
        
        return TxSignForm;
    }
);
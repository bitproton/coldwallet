define(
    [
        'js/Organizator/Organizator/Application',
        'js/Organizator/Apps/FormStd/FormStd',
        'js/node_modules/bitcoincashjs-lib/dist/bitcoincashjs-lib.min',
        'text!./Resources/view/tx-preview.html.njk',
        'text!./Resources/view/tx-preview-blank.html.njk',
        'js/Organizator/Component/Validation/Constraint/NotBlank',
        'css!./Resources/css/style'
    ],
    function(
        Organizator_Application,
        FormStd,
        bitcoinjs,
        tpl_txPreview,
        tpl_txPreviewBlank
    ){
        class TxViewer extends Organizator_Application {
            constructor(){
                super('TxViewer');
            }

            clearPreview(target){
                let txPreview = Organizator.Nunjucks.renderString(tpl_txPreviewBlank);

                target.innerHTML = txPreview;
            }

            render(txbody, txmeta, target, mode = 'standard'){
                window.bitcoinjs = bitcoinjs;

                if((txbody == '' || txbody == null) || (txmeta == '' || txmeta == null)){
                    this.clearPreview(target);

                    return;
                }

                try{
                    var tx = new bitcoinjs.Transaction.fromHex(txbody);
                    var txmeta = JSON.parse(txmeta);
                }catch(e){
                    this.clearPreview(target);

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

                    txb.tx.setInputScript(i++, bitcoinjs.script.fromASM(inputMeta.scriptPubKey));
                }

                let transaction = this.txToJson(txb.tx, txmeta);
                transaction = this.hydrateToView(transaction, mode);

                let txPreview = Organizator.Nunjucks.renderString(tpl_txPreview, {
                    transaction: transaction,
                    mode: mode
                });

                target.innerHTML = txPreview;
            }

            decodeToBitcoindAwareFormat(tx){
                var result = {};

                result.txid = tx.getId();
                result.version = tx.version;
                result.locktime = tx.locktime;
                result.size = tx.byteLength();
                result.vsize = tx.virtualSize();
                result.vin = [];
                result.vout = this.decodeOutput(tx);

                tx.ins.forEach(function(input, n){
                    var vin = {
                        txid: input.hash.reverse().toString('hex'),
                        n : input.index,
                        script: bitcoinjs.script.toASM(input.script),
                        sequence: input.sequence,
                        scriptPubKey: {
                            asm: '',
                            hex: ''
                        }
                    }

                    input.hash.reverse(); // Find NOTEID:1 on this file 

                    result.vin.push(vin);
                });

                return result;
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

            txHexToJson(hex, txmeta){
                let tx = bitcoinjs.Transaction.fromHex(hex);
                
                if(typeof txmeta !== 'undefined'){
                    var txmeta = JSON.parse(txmeta);
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

            hydrateToView(transaction, mode){
                transaction.fee = 0;
                transaction.totalSpent = 0;

                for(let input of transaction.vin){
                    transaction.fee += parseInt(input.value);
                    transaction.totalSpent -= parseInt(input.value);
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

                return transaction;
            }
        }
        
        return TxViewer;
    }
);
define(
    [
        'js/Organizator/Organizator/Application',
        './Component/AddressCollection/AddressCollection',
        './Component/KeyManager/KeyManager',
        './Component/TxSignForm/TxSignForm',
        'text!./Resources/view/wallet.html.njk',
        'text!./Resources/view/tx-sign-form.html.njk',
        'text!./Resources/view/transaction.html.njk',
        'css!./Resources/css/style'
    ],
    function(
        Organizator_Application,
        AddressCollection,
        KeyManager,
        TxSignForm,
        tpl_wallet,
        tpl_txSignForm,
        tpl_transaction
    ){
        class Wallet extends Organizator_Application {
            constructor(){
                super('Wallet');

                this.target = document.querySelector('.mainSection');
                this.addressCollection = Organizator.PersistentDb.addCollection('key');
                this.transactionCollection = Organizator.PersistentDb.addCollection('transaction', {
                    unique: ['txid']
                });

                this.render();
            }

            render(){
                let addresses = Organizator.PersistentDb.getCollection('key').chain().find().simplesort('$loki', true).data();
                let transactions = Organizator.PersistentDb.getCollection('transaction').chain().find({}).simplesort('$loki', true).data();

                let content = Organizator.Nunjucks.renderString(tpl_wallet, {
                    wallet: {
                        addresses: addresses,
                        transactions: transactions
                    }
                });

                this.target.innerHTML = content;

                this.setElements();
                this.bindEvents();
            }

            setElements(){
                this.wallet = document.querySelector('.js__wallet');
                this.KeyManager = new KeyManager;
                this.AddressCollection = new AddressCollection;
                this.signTransactionButtons = this.wallet.querySelectorAll('.js__signTransaction');
                this.txCollection = document.querySelector('.js__transactionCollection');
                this.transactions = this.wallet.querySelectorAll('.js__tx');
                this.transactionsSectionIfEmpty = this.wallet.querySelector('.transactionsSectionIfEmpty');

                this.clearTxHistoryButtons = this.wallet.querySelectorAll('.js__clearTxHistory');
            }

            refreshElements(){
                this.transactions = document.querySelectorAll('.js__wallet .js__tx');
            }

            refresh(){
                this.refreshElements();
                this.rebindEvents();
            }

            createRemovableEvents(){
                this.transactionClicked = this.transactionClicked.bind(this);
            }

            bindEvents(){
                this.createRemovableEvents();

                this.signTransactionButtons.forEach(element => element.addEventListener('click', this.signTransactionButtonClicked.bind(this)));
                this.transactions.forEach(element => element.addEventListener('click', this.transactionClicked));
                this.clearTxHistoryButtons.forEach(element => element.addEventListener('click', this.clearTxHistoryButtonClicked.bind(this)));
            }

            rebindEvents(){
                var self = this;

                this.transactions.forEach(function(element){
                    element.removeEventListener('click', self.transactionClicked);
                    element.addEventListener('click', self.transactionClicked);
                });
            }

            clearTxHistoryButtonClicked(event){
                event.preventDefault();

                if(confirm('Do you want to clear transaction history?', Organizator.applications.MyApp.name)){
                    this.transactionCollection.clear();
                    Organizator.PersistentDb.saveDatabase();
                    this.txCollection.innerHTML = '';
                    this.txCollection.classList.add('hide');
                    this.transactionsSectionIfEmpty.classList.remove('hide');
                }
            }

            signTransactionButtonClicked(event){
                event.preventDefault();

                let content = Organizator.Nunjucks.renderString(tpl_txSignForm);
                let modal = Organizator.applications.ModalManager.new({
                    content: content
                });
                
                modal.show();
                this.TxSignForm = new TxSignForm(modal);
            }

            transactionClicked(event){
                event.preventDefault();

                let element = event.currentTarget;
                let txid = element.getAttribute('data-object-txid');
                let txObject = this.transactionCollection.findOne({
                    txid: txid
                });
                let content = Organizator.Nunjucks.renderString(tpl_txSignForm);
                let modal = Organizator.applications.ModalManager.new({
                    content: content
                });
                
                modal.show();
                this.TxSignForm = new TxSignForm(modal);

                this.TxSignForm.checkboxes.forEach(function(element){
                    element.checked = true;
                    element.dispatchEvent(new Event('click'));
                });
                this.TxSignForm.field_txbodyunsigned.value = txObject.txbodyunsigned;
                this.TxSignForm.field_txbodyunsigned.dispatchEvent(new Event('input'));
                this.TxSignForm.field_txmeta.value = JSON.stringify(txObject.txmeta);
                this.TxSignForm.field_txmeta.dispatchEvent(new Event('input'));

                modal.show();
            }
        }
        
        return Wallet;
    }
);
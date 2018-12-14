define(
    [
        'js/node_modules/qrious/dist/qrious.min',
        'text!./Resources/view/detail-modal.html.njk',
        'css!./Resources/css/style'
    ],
    function(
        QRious,
        tpl_detailModal
    ){
        class AddressCollection {
            constructor(){
                this.collection = Organizator.PersistentDb.getCollection('key');
                this.addressCollectionElement = Organizator.applications.Wallet.wallet.querySelector('.js__addressCollection');
                this.addressCardElements = this.addressCollectionElement.querySelectorAll('.js__addressCard');
                this.addressCollectionSectionIfEmpty = Organizator.applications.Wallet.wallet.querySelector('.js__addressCollectionSectionIfEmpty');
                this.addressDeleteButtons = Organizator.applications.Wallet.wallet.querySelectorAll('.js__deleteAddressButton');
                this.addressDetailButtons = Organizator.applications.Wallet.wallet.querySelectorAll('.js__showAddressDetails');

                this.bindEvents();
            }

            // For requerying elements which have been dynamically added to the page
            refresh(){
                this.refreshElements();
                this.rebindEvents();
            }

            refreshElements(){
                this.addressCardElements = this.addressCollectionElement.querySelectorAll('.js__addressCard');                
                this.addressDeleteButtons = Organizator.applications.Wallet.wallet.querySelectorAll('.js__deleteAddressButton');
                this.addressDetailButtons = Organizator.applications.Wallet.wallet.querySelectorAll('.js__showAddressDetails');
            }

            createRemovableEvents(){
                this.deleteButtonClicked = this.deleteButtonClicked.bind(this);
                this.detailButtonClicked = this.detailButtonClicked.bind(this);
            }

            bindEvents(){
                this.createRemovableEvents();

                this.addressDeleteButtons.forEach(element => element.addEventListener('click', this.deleteButtonClicked));
                this.addressDetailButtons.forEach(element => element.addEventListener('click', this.detailButtonClicked));
            }

            rebindEvents(){
                let self = this;

                this.addressDeleteButtons.forEach(function(element){
                    element.removeEventListener('click', self.deleteButtonClicked);
                    element.addEventListener('click', self.deleteButtonClicked);
                });

                this.addressDetailButtons.forEach(function(element){
                    element.removeEventListener('click', self.detailButtonClicked);
                    element.addEventListener('click', self.detailButtonClicked);
                });
            }

            toggleContainers(){
                switch(this.addressCardElements.length){
                    case 1:
                        this.addressCollectionElement.classList.remove('hide');
                        this.addressCollectionSectionIfEmpty.classList.add('hide');
                        break;
                    case 0:
                        this.addressCollectionElement.classList.add('hide');
                        this.addressCollectionSectionIfEmpty.classList.remove('hide');
                        break;
                }
            }

            add(html, position){
                this.addressCollectionElement.insertAdjacentHTML(position, html);

                this.refresh();
                this.toggleContainers();
            }

            remove(addressCard){
                let address = addressCard.getAttribute('data-object-address');
                let loki_id = addressCard.getAttribute('data-object-id');
                let addressObject = this.collection.get(loki_id);

                addressCard.parentNode.removeChild(addressCard);
                this.collection.remove(addressObject);
                Organizator.PersistentDb.saveDatabase();

                this.refresh();
                this.toggleContainers();
            }

            empty(){
                Organizator.applications.Wallet.addressCollectionElement.innerHTML = '';

                this.toggleContainers();
                Organizator.applications.Wallet.recalculateFieldValues();
            }

            deleteButtonClicked(event){
                event.preventDefault();

                let element = event.currentTarget;
                let addressCardElement = element.parents('.js__addressCard')[0];
                let addressIdentifier = addressCardElement.getAttribute('data-object-address');

                if(confirm('Do you want to delete this address from your wallet?', Organizator.applications.MyApp.name)){
                    this.remove(addressCardElement);
                };
            }

            detailButtonClicked(event){
                event.preventDefault();

                let element = event.currentTarget;
                let addressCard = element.parents('.js__addressCard')[0];
                let address = addressCard.getAttribute('data-object-address');
                let keypair = this.collection.findOne({
                  '$or': [
                    {'address': address},
                    // {'segwitaddress': address},
                    // {'multisigaddress': address}
                    ]
                });

                let content = Organizator.Nunjucks.renderString(tpl_detailModal, {
                    keypair: keypair
                });
                let modal = Organizator.applications.ModalManager.new({
                    content: content
                });

                modal.element.querySelectorAll('.js__showPassword').forEach(element => element.addEventListener('click', this.showPasswordButtonClicked.bind(this)));

                let qrElement = modal.element.querySelector('.qrCode');

                // switch(keypair.type){
                    // case 'legacy':
                        var qrcode = new QRious({
                          element: qrElement,
                          value: 'bitcoinsv:' + keypair.address,
                          size: 200
                        });
                        // break;
                    // case 'segwit':
                    //     var qrcode = new QRious({
                    //       element: qrElement,
                    //       value: 'bitcoin:' + keypair.segwitaddress,
                    //       size: 200
                    //     });
                    //     break;
                    // case 'multisig':
                    //     var qrcode = new QRious({
                    //       element: qrElement,
                    //       value: 'bitcoin:' + keypair.multisigaddress,
                    //       size: 200
                    //     });
                    //     break;
                // }

                modal.show();
            }

            showPasswordButtonClicked(event){
                event.preventDefault();

                let element = event.currentTarget;
                let icon = element.querySelector('.fa');
                let input = element.parents('.inputContainer')[0].querySelector('input');

                if(input.type === 'password'){
                    input.type = 'text';
                    input.value = sjcl.decrypt(Organizator.applications.Auth.password, input.value);
                }else{
                    input.type = 'password';
                    input.value = sjcl.encrypt(Organizator.applications.Auth.password, input.value);
                }

                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        }
        
        return AddressCollection;
    }
);
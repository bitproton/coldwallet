 define(
    [
        'text!./Resources/view/multisig-keys-fieldset.html.njk'
    ],
    function(
        tpl_multisigKeysFieldSet
    ){
        class MultisigKeysFieldsetCollection {
            constructor(element){
                this.element = element;
                this.addButton = this.element.querySelector('.js__addMultisigKey');
                this.removeButtons = this.element.querySelectorAll('.js__removeMultisigKey');
                this.collection = this.element.querySelector('.form-group-collection');
                this.fieldsets = this.element.querySelectorAll('.form-group-collection > li');
                this._counter = this.fieldsets.length;
                this.best = this.fieldsets.length;

                this.addButtonClicked = this.addButtonClicked.bind(this);
                this.removeButtonClicked = this.removeButtonClicked.bind(this);

                this.bindEvents();
            }

            set counter(counter){
                if(counter === 1){
                    this.element.classList.remove('state--multichild');
                    this.element.classList.add('state--onlychild');
                }

                if(counter > 1){
                    this.element.classList.remove('state--onlychild');
                    this.element.classList.add('state--multichild');
                }

                this.recalculateIndex();
                Organizator.applications.Wallet.KeyManager.NewAddressForm.formController.refreshElements();
                
                this._counter = counter;
            }

            get counter(){
                return this._counter;
            }

            refreshElements(){
                this.addButton = this.element.querySelector('.js__addMultisigKey');
                this.removeButtons = this.element.querySelectorAll('.js__removeMultisigKey');
                this.fieldsets = this.element.querySelectorAll('.form-group-collection > li');
            }

            bindEvents(){
                var self = this;
                
                this.addButton.removeEventListener('click', this.addButtonClicked);
                this.addButton.addEventListener('click', this.addButtonClicked);

                if(this.removeButtons.length > 0){
                    this.removeButtons.forEach(function(element){
                        element.removeEventListener('click', self.removeButtonClicked);
                        element.addEventListener('click', self.removeButtonClicked);
                    });
                }
            }

            recalculateIndex(){
                let i = 1;
                for(let fieldset of this.fieldsets){
                    fieldset.querySelector('label').innerHTML = '#' + i;

                    i++;
                }
            }  

            addButtonClicked(event){
                if(this.counter >= 15){return;}

                let index = this.best > this.counter ? (this.best + 1) : this.counter;

                this.collection.insertAdjacentHTML('beforeend', Organizator.Nunjucks.renderString(tpl_multisigKeysFieldSet, {
                    index: index
                }));

                this.refreshElements();
                this.bindEvents();
                Organizator.applications.Wallet.KeyManager.NewAddressForm.refresh();

                this.counter++;
                if(this.counter > this.best){
                    this.best = this.counter;
                }else{
                    this.best++;
                }
            }

            removeButtonClicked(event){
                if(this.counter <= 1){return;}

                let element = event.currentTarget;
                let fieldset = element.parents('li')[0];
                
                if(fieldset !== null){
                    fieldset.parentNode.removeChild(fieldset);

                    this.refreshElements();
                    this.bindEvents();
                    Organizator.applications.Wallet.KeyManager.NewAddressForm.refresh();                
                    Organizator.applications.Wallet.KeyManager.NewAddressForm.field_reqkeycount.dispatchEvent(new Event('input'));
                    
                    this.counter--
                }
            }
        }
        
        return MultisigKeysFieldsetCollection;
    }
);
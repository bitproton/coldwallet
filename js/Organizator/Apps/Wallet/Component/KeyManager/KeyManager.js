define(
    [
        './Component/NewAddressForm/NewAddressForm',
        'text!./Resources/view/form.html.njk',
        'css!./Resources/css/style'
    ],
    function(
        NewAddressForm,
        tpl_form
    ){
        class KeyManager {
            constructor(){
                this.newAddressButtons = Organizator.applications.Wallet.wallet.querySelectorAll('.js__newAddress');
                this.modal;
                this.NewAddressForm;

                this.bindEvents();
            }

            bindEvents(){
                this.newAddressButtons.forEach(element => element.addEventListener('click', this.newAddressButtonClicked.bind(this)));
            }

            newAddressButtonClicked(event){
                event.preventDefault();

                let content = Organizator.Nunjucks.renderString(tpl_form);
                this.modal = Organizator.applications.ModalManager.new({
                    content: content,
                    onclose: this.onModalClose.bind(this)
                });
                
                this.modal.show();
                this.NewAddressForm = new NewAddressForm(this.modal.element);
            }

            onModalClose(){

            }
        }
        
        return KeyManager;
    }
);
define(
    [
        'js/Organizator/Organizator/Application',
        'js/Organizator/Apps/FormStd/FormStd',
        'text!./Resources/view/form.html.njk',
        'text!./Resources/view/unlock-form.html.njk',
        'text!./Resources/view/change-form.html.njk',
        'js/Organizator/Component/Validation/Constraint/NotBlank',
        'js/Organizator/Component/Validation/Constraint/Length',
        'js/Organizator/Component/Validation/Constraint/Same',
        'js/Organizator/src/Constraint/Password'
    ],
    function(
        Organizator_Application,
        FormStd,
        tpl_form,
        tpl_unlockForm,
        tpl_changeForm
    ){
        class Auth extends Organizator_Application {
            constructor(){
                super('Auth');

                this.collection = Organizator.PersistentDb.addCollection('auth');
                this.message = '0BA45D3A9A324FCC60EC405CE777D82C399389B8550B22A4FE2747AAFD95D134';
                this.setPasswordFormName = 'auth_setpassword';
                this.changePasswordFormName = 'auth_changepassword';
                this.unlockWalletFormName = 'auth_unlock';
                this.auth = this.collection.get(1);
                this.password = '';
                this.changePasswordButton = Organizator.applications.Wallet.wallet.querySelector('.js__changePassword');
                this._state = 0;
                this.state = 0;
                this.idleTime = 100 * 60 * 10 * 5 // 5 minute;

                this.prompt();
                this.bindEvents();
            }

            set state(state){
                switch(state){
                    case 0:
                        if(typeof this.intervalId !== 'undefined'){
                            clearInterval(this.intervalId);
                            this.intervalId = undefined;
                        }
                        break;
                    case 1:
                        this.intervalId = setInterval(this.goInactive.bind(this), this.idleTime);
                        break;
                }

                return this._state;
            }

            bindEvents(){
                this.changePasswordButton.addEventListener('click', this.changePasswordButtonClicked.bind(this));
                
                window.addEventListener("mousemove", this.resetInterval.bind(this));
                window.addEventListener("mousedown", this.resetInterval.bind(this));
                window.addEventListener("keypress", this.resetInterval.bind(this));
                window.addEventListener("DOMMouseScroll", this.resetInterval.bind(this));
                window.addEventListener("mousewheel", this.resetInterval.bind(this));
                window.addEventListener("touchmove", this.resetInterval.bind(this));
                window.addEventListener("MSPointerMove", this.resetInterval.bind(this));
            }

            prompt(){
                this.password = '';

                if(this.collection.get(1) === null){
                    let content = Organizator.Nunjucks.renderString(tpl_form);

                    this.modal = Organizator.applications.ModalManager.new({
                        content: content,
                        closeOnOverlayClick: false,
                        closeOnKeydown: false
                    });

                    this.setPasswordForm = this.modal.element.querySelector('form[name="' + this.setPasswordFormName + '"]');
                    this.setPasswordFormController = new FormStd(this.setPasswordForm, this.setPasswordFormName, {
                        validationMode: 'onInputChange',
                        isRequest: false,
                        hideBlankFieldErrors: true,
                        onFormSuccess: this.onSetPasswordFormSuccess.bind(this)
                    });
                    this.auth_setpassword_first = this.setPasswordForm.querySelector('[name="' + this.setPasswordFormName + '[first]"]');
                    this.auth_setpassword_second = this.setPasswordForm.querySelector('[name="' + this.setPasswordFormName + '[second]"]');

                    // modal tabindex trap
                    let inputs = this.modal.element.querySelectorAll('select, input, textarea, button, a');
                    let firstInput = inputs[0];
                    let lastInput = inputs[inputs.length - 1];

                    lastInput.addEventListener('keydown', function(event){
                       if ((event.which === 9 && !event.shiftKey)){
                           event.preventDefault();
                           firstInput.focus();
                       }
                    });

                    firstInput.addEventListener('keydown', function(event){
                        if ((event.which === 9 && event.shiftKey)){
                            event.preventDefault();
                            lastInput.focus();
                        }
                    });

                    this.modal.show();
                }else{
                    let content = Organizator.Nunjucks.renderString(tpl_unlockForm);

                    this.modal = Organizator.applications.ModalManager.new({
                        content: content,
                        closeOnOverlayClick: false,
                        closeOnKeydown: false
                    });

                    this.unlockWalletForm = this.modal.element.querySelector('form[name="' + this.unlockWalletFormName + '"]');
                    this.unlockWalletFormController = new FormStd(this.unlockWalletForm, this.unlockWalletFormName, {
                        validationMode: 'onInputChange',
                        isRequest: false,
                        hideBlankFieldErrors: true,
                        onFormSuccess: this.onUnlockWalletFormSuccess.bind(this)
                    });
                    this.auth_unlockwallet_password = this.unlockWalletForm.querySelector('[name="' + this.unlockWalletFormName + '[password]"]');

                    // modal tabindex trap
                    let inputs = this.modal.element.querySelectorAll('select, input, textarea, button, a');
                    let firstInput = inputs[0];
                    let lastInput = inputs[inputs.length - 1];

                    lastInput.addEventListener('keydown', function(event){
                       if ((event.which === 9 && !event.shiftKey)){
                           event.preventDefault();
                           firstInput.focus();
                       }
                    });

                    firstInput.addEventListener('keydown', function(event){
                        if ((event.which === 9 && event.shiftKey)){
                            event.preventDefault();
                            lastInput.focus();
                        }
                    });

                    this.modal.show();
                }
            }

            changePasswordButtonClicked(event){
                event.preventDefault();

                let content = Organizator.Nunjucks.renderString(tpl_changeForm);

                this.modal = Organizator.applications.ModalManager.new({
                    content: content,
                    closeOnOverlayClick: false
                });

                this.changePasswordForm = this.modal.element.querySelector('form[name="' + this.changePasswordFormName + '"]');
                this.changePasswordFormController = new FormStd(this.changePasswordForm, this.changePasswordFormName, {
                    validationMode: 'onSubmit',
                    isRequest: false,
                    hideBlankFieldErrors: true,
                    onFormSuccess: this.onChangePasswordFormSuccess.bind(this)
                });
                this.auth_changepassword_current = this.changePasswordForm.querySelector('[name="' + this.changePasswordFormName + '[current]"]');
                this.auth_changepassword_first = this.changePasswordForm.querySelector('[name="' + this.changePasswordFormName + '[first]"]');
                this.auth_changepassword_second = this.changePasswordForm.querySelector('[name="' + this.changePasswordFormName + '[second]"]');
                
                this.modal.show();
            }

            onSetPasswordFormSuccess(){
                if(this.auth_setpassword_first.value == this.auth_setpassword_second.value){
                    let auth = this.collection.insert({
                        password: sjcl.encrypt(this.auth_setpassword_first.value, this.message)
                    });
                    this.auth = auth;
                    this.password = this.auth_setpassword_first.value;
                    Organizator.PersistentDb.saveDatabase();
                    Organizator.applications.ModalManager.remove(this.modal);

                    this.state = 1;
                }
            }

            onUnlockWalletFormSuccess(){
                try{
                    if(sjcl.decrypt(this.auth_unlockwallet_password.value, this.auth.password) === this.message){
                        this.password = this.auth_unlockwallet_password.value;
                        Organizator.applications.ModalManager.remove(this.modal);
                        
                        this.state = 1;
                    }
                }catch($e){
                    let notice = this.unlockWalletForm.querySelector('.notice');
                    notice.classList.remove('notice--yellow');
                    notice.classList.add('notice--red');
                    notice.innerHTML = 'Password is incorrect.';
                }
            }

            onChangePasswordFormSuccess(){
                var self = this;

                if(this.auth_changepassword_first.value === this.auth_changepassword_second.value){
                    let oldPassword = this.auth_changepassword_current.value;
                    this.password = this.auth_changepassword_first.value;
                    this.auth.password = sjcl.encrypt(this.password, this.message);

                    for(let key of Organizator.PersistentDb.getCollection('key').data){
                        switch(key.type){
                            case 'legacy':
                            case 'segwit':
                                key.privatekey = sjcl.encrypt(this.password, sjcl.decrypt(oldPassword, key.privatekey));
                                break;

                            case 'multisig':
                                key.privatekeys.forEach(function(privatekey, i){
                                    key.privatekeys[i] = sjcl.encrypt(self.password, sjcl.decrypt(oldPassword, privatekey));
                                });
                                break;
                        }
                    }

                    Organizator.PersistentDb.saveDatabase();
                    Organizator.applications.ModalManager.remove(this.modal);
                }
            }

            goInactive(){
                this.state = 0;
                this.prompt();
            }

            resetInterval(){
                if(typeof this.intervalId !== 'undefined'){ 
                    this.state = 0;
                    this.state = 1;
                }
            }
        }
        
        return Auth;
    }
);
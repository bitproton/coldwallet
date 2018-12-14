define(
    [
        'js/Organizator/Organizator/Application',
        'text!./Resources/view/advice-row.html.njk'
    ],
    function(
        Organizator_Application,
        tpl_advice_row
    ){
        class FormStd extends Organizator_Application {
            constructor(form, identifier, options){
                super('FormStd_' + identifier);

                this.form = form;
                this.formName = form.getAttribute('name');
                this.formFields = this.form.querySelectorAll('input, textarea, select, button');
                this.formFieldsToBeValidated = this.form.querySelectorAll('.js__input[org-validate]');
                this.submitButtons = this.form.querySelectorAll('[type="submit"]');
                this.formGroups = this.form.querySelectorAll('.js__formGroup');
                this.serverResponse = undefined;
                this.isOnProgress = false;
                this.isRequest = true;
                this.isXMLHttpRequest = false;
                this.validationMode = 'onInputChange';
                this.validateOnSubmit = true;
                this.hideBlankFieldErrors = true;
                this.onFormSuccess = false;
                this.onFormError = false;

                Object.assign(this, options);

                this.onInputChange = this.onInputChange.bind(this);
                this.formSubmitted = this.formSubmitted.bind(this);
                this.onSubmitValidate = this.onSubmitValidate.bind(this);
                this.noRequestValidate = this.noRequestValidate.bind(this);

                this.bindEvents();
                this.normalizeForm();
            }

            refreshElements(){
                this.formFields = this.form.querySelectorAll('input, textarea, select, button');
                this.formFieldsToBeValidated = this.form.querySelectorAll('.js__input[org-validate]');
                this.submitButtons = this.form.querySelectorAll('[type="submit"]');
                this.formGroups = this.form.querySelectorAll('.js__formGroup');
            }

            /*
             * Event listeners should be removed before added because preventing double-fired events
             * after rebinding events when new form elements added to form (and form controller).
             * 
             * We can rebind events unlimited time safely since we remove event listeners before adding them. 
             */
            bindEvents(){
                var self = this;

                if(this.isRequest){
                    if(this.isXMLHttpRequest){
                        this.form.addEventListener('submit', this.formSubmitted);
                    }else{
                        if(this.validateOnSubmit){
                            this.form.addEventListener('submit', this.onSubmitValidate);
                        }
                    }
                }else{
                    this.form.addEventListener('submit', this.noRequestValidate);
                }

                switch(typeof this.validationMode){
                    case 'string':
                        switch(this.validationMode){
                            case 'onInputBlur':
                                this.formFieldsToBeValidated.forEach(function(element){
                                    element.removeEventListener('blur', self.onInputChange);
                                    element.addEventListener('blur', self.onInputChange);
                                });
                                break;
                            case 'onInputChange':
                                this.formFieldsToBeValidated.forEach(function(element){
                                    element.removeEventListener('input', self.onInputChange);
                                    element.addEventListener('input', self.onInputChange);
                                });
                                break;
                            case 'onFormSubmit':
                                this.form.addEventListener('submit', this.validateForm);
                                break;
                        }
                        break;
                    case 'object':
                        for(let item of this.validationMode){
                            switch(item){
                                case 'onInputBlur':
                                    this.formFieldsToBeValidated.forEach(function(element){
                                        element.removeEventListener('blur', self.onInputChange);
                                        element.addEventListener('blur', self.onInputChange);
                                    });
                                    break;
                                case 'onInputChange':
                                    this.formFieldsToBeValidated.forEach(function(element){
                                        element.removeEventListener('input', self.onInputChange);
                                        element.addEventListener('input', self.onInputChange);
                                    });
                                    break;
                                case 'onFormSubmit':
                                    this.form.addEventListener('submit', this.validateForm);
                                    break;
                            }
                        }
                        break;
                }
            }

            normalizeForm(){
                this.form.setAttribute('novalidate', 'novalidate');
            }

            formSubmitted(event){
                event.preventDefault();

                this.lockForm();
                if(this.validateOnSubmit && this.onSubmitValidate(event) === false){
                    event.preventDefault();

                    this.unlockForm();
                    return false;
                }

                let self = this;
                let action = this.form.getAttribute('action');
                let method = this.form.getAttribute('method');
                let formData = new FormData(this.form);

                let xhr = new XMLHttpRequest();
                xhr.open(method, action);

                xhr.addEventListener('loadstart', function(){
                    this.isOnProgress = true;
                });

                xhr.addEventListener('load', function(){
                    self.serverResponse = JSON.parse(this.responseText);

                    if(self.serverResponse.form.isValid){
                        if(typeof self.onFormSuccess === 'function'){
                            self.onFormSuccess(self.serverResponse);
                        }
                    }else{
                        self.renderErrors(self.serverResponse.form.errors);

                        if(typeof self.onFormError === 'function'){
                            self.onFormError(self.serverResponse);
                        }
                    }

                    self.unlockForm();
                });
                xhr.addEventListener('onerror abort timeout', function(){
                    self.unlockForm();
                });
                xhr.send(formData);
                xhr = undefined;
            }

            onInputChange(event){
                let element = event.currentTarget;
                let formGroupElement = element.parents('.js__formGroup')[0];

                /*
                 * If value is empty, remove all messages including exception messages for NotBlank constraint.
                 * NotBlank errors has negative effect on UX when real-time form usage. 
                 * It's better to show NotBlank errors for only server-side responses.
                 */
                if(this.hideBlankFieldErrors && element.value.length == 0){
                    formGroupElement.classList.remove('error');
                    let adviceRowElement = formGroupElement.querySelector('.adviceRow');
                    let newAdviceRow = Organizator.Nunjucks.renderString(tpl_advice_row, {
                            errors: []
                        });
                    if(adviceRowElement === undefined || adviceRowElement === null){
                        formGroupElement.insertAdjacentHTML('beforeend', newAdviceRow);
                    }else{
                        adviceRowElement.outerHTML = newAdviceRow;
                    }

                    return;
                }

                let itemValidationResult = Organizator.Validator.validateHTMLElement(element);
                let fieldErrors = [];

                for(let fieldConstraintsKey in itemValidationResult.constraints){
                    let fieldConstraints = itemValidationResult.constraints[fieldConstraintsKey];
                    if(fieldConstraints.errorCount == 0){
                        formGroupElement.classList.remove('error');
                        continue;
                    }

                    formGroupElement.classList.add('error');

                    for(let error of fieldConstraints.errors){
                        fieldErrors.push(error);
                    }

                    let adviceRowElement = formGroupElement.querySelector('.adviceRow');
                    let newAdviceRow = Organizator.Nunjucks.renderString(tpl_advice_row, {
                            errors: fieldErrors
                        });
                    if(adviceRowElement === undefined || adviceRowElement === null){
                        formGroupElement.insertAdjacentHTML('beforeend', newAdviceRow);
                    }else{
                        adviceRowElement.outerHTML = newAdviceRow;
                    }
                } 
            }

            onSubmitValidate(event){
                let formValidationResult = Organizator.Validator.validateForm(this.form);
                
                if(formValidationResult.errorCount > 0){
                    
                    for(let itemValidationResult of formValidationResult.results){
                        let formGroupElement = itemValidationResult.item.parents('.js__formGroup')[0];
                        let fieldErrors = [];

                        for(let fieldConstraintsKey in itemValidationResult.constraints){
                            let fieldConstraints = itemValidationResult.constraints[fieldConstraintsKey];
                            if(fieldConstraints.errorCount == 0){
                                formGroupElement.classList.remove('error');
                                continue;
                            }

                            formGroupElement.classList.add('error');

                            for(let error of fieldConstraints.errors){
                                fieldErrors.push(error);
                            }

                            let adviceRowElement = formGroupElement.querySelector('.adviceRow');
                            let newAdviceRow = Organizator.Nunjucks.renderString(tpl_advice_row, {
                                    errors: fieldErrors
                                });
                            if(adviceRowElement === undefined || adviceRowElement === null){
                                formGroupElement.insertAdjacentHTML('beforeend', newAdviceRow);
                            }else{
                                adviceRowElement.outerHTML = newAdviceRow;
                            }
                        } 
                    }

                    event.preventDefault();
                }

                return formValidationResult.isValid;
            }

            noRequestValidate(event){
                event.preventDefault();

                let isValid =  this.onSubmitValidate(event);

                if(isValid){
                    if(typeof this.onFormSuccess === 'function'){
                        this.onFormSuccess();
                    }
                }else{
                    if(typeof this.onFormError === 'function'){
                        this.onFormError();
                    }
                }
            }

            clearErrors(){
                let adviceRows = this.form.querySelectorAll('.adviceRow');
                
                for(let row of adviceRows){
                    row.innerHTML = '';
                }
            }

            renderErrors(errors){
                for(let formGroupElement of this.formGroups){
                    let fieldName = formGroupElement.getAttribute('for').replace(this.formName + '_', '');
                    let fieldErrors = errors[fieldName];
                    
                    if(typeof fieldErrors === 'undefined' || fieldErrors.length == 0){continue;}

                    let adviceRowElement = formGroupElement.querySelector('.adviceRow');
                    let newAdviceRow = Organizator.Nunjucks.renderString(tpl_advice_row, {
                            errors: fieldErrors
                        });
                    if(adviceRowElement === undefined || adviceRowElement === null){
                        formGroupElement.insertAdjacentHTML('beforeend', newAdviceRow);
                    }else{
                        adviceRowElement.outerHTML = newAdviceRow;
                    }
                }
            }

            lockForm(){
                this.isOnProgress = true;

                for(let button of this.submitButtons){
                    if(!button.hasAttribute('disabled')){
                        button.classList.add('js__disabledByFormStd');
                        button.setAttribute('data-initialhtml', button.innerHTML);
                        button.innerHTML = 'Please wait..';
                        button.setAttribute('disabled', '');
                    }
                }

                for(let element of this.formFields){
                    if(!element.hasAttribute('readonly')){
                        element.classList.add('js__readonlyByFormStd');
                        element.setAttribute('readonly', '');
                    }
                }
            }

            unlockForm(){
                this.isOnProgress = false;

                for(let button of this.submitButtons){
                    if(button.classList.contains('js__disabledByFormStd')){
                        button.classList.remove('js__disabledByFormStd');
                        button.innerHTML = button.getAttribute('data-initialhtml');
                        button.removeAttribute('disabled');
                    }
                }

                for(let element of this.formFields){
                    if(element.classList.contains('js__readonlyByFormStd')){
                        element.classList.remove('js__readonlyByFormStd');
                        element.removeAttribute('readonly');
                    }
                }
            }
        }
        
        return FormStd;
    }
);
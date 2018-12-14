define(
    [
        'js/Organizator/Organizator/Application',
        './src/Object/Modal',
        'css!./Resources/css/style'
    ],
    function(
        Organizator_Application,
        Modal
    ){
        class ModalManager extends Organizator_Application {
            constructor(){
                super('ModalManager');

                this.modals = [];
                this.rootElements = document.querySelectorAll('html, body');
                this._listenOnKeydown = 0;

                this.bindEvents();
            }

            set listenOnKeydown(count){
                this._listenOnKeydown = count;

                if(this.listenOnKeydown == 0){
                    document.body.removeEventListener('keydown', this.onKeydown);
                }

                if(this.listenOnKeydown == 1){
                    document.body.addEventListener('keydown', this.onKeydown);
                }

                return count;
            }

            get listenOnKeydown(){
                return this._listenOnKeydown;
            }

            bindEvents(){
                // this.loginButtons.forEach(element => element.addEventListener('click', this.loginButtonClicked.bind(this)));
            }

            new(options = {}){         
                options.identifier = typeof options.identifier !== 'undefined' ? options.identifier : 'mmModal_' + (this.modals.length + 1);
                
                let modal = new Modal(options);

                this.modals.push(modal);

                this.rootElements.forEach(function(element){
                    element.classList.add('mmModal--active');
                });

                return modal;
            }

            remove(modal, omitOnBeforeClose = false){
                if(typeof modal.onbeforeclose === 'function' && omitOnBeforeClose === false){
                    if(!modal.onbeforeclose()){
                        return false;
                    }
                }

                switch(typeof modal){
                    case 'string':
                        let modalObject = this.modals.filter(function(m){
                            return m.identifier == modal;
                        })[0];

                        this.remove(modalObject);
                        break;
                    case 'object':
                        modal.element.parentNode.removeChild(modal.element);
                        
                        if(typeof modal.onclose === 'function'){
                            modal.onclose();
                        }

                        this.modals.splice(this.modals.indexOf(modal.element));

                        break;
                }

                if(this.modals.length == 0){
                    this.rootElements.forEach(function(element){
                        element.classList.remove('mmModal--active');
                    });
                }

                return true;
            }

            /*
             * Keydown events must be listened in ModalManager because
             * if two Modal instances listen keydowns independently
             * they will both be closed when e.g. 'esc' typed.
             */
            onKeydown(event){
                var self = Organizator.applications.ModalManager;

                for(let i = self.modals.length - 1; i >= 0; i--){
                    let modal = self.modals[i];

                    // pass if modal is not shown
                    if(modal.state === 0){continue;}

                    if(event.which == modal.closeOnKeydown){
                        if(self.remove(modal)){
                            self.listenOnKeydown -= 1;
                        }
                    }
                    break;
                }
            }
        }
        
        return ModalManager;
    }
);
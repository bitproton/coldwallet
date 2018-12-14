define(
    [
        'text!../../Resources/view/base.html.njk'
    ],
    function(
        tpl_base
    ){
        class Modal {
            constructor(options = {}){
                this.identifier = 'mmModal_0';
                this.width = '520';
                this.height = '520';
                this.title = '';
                this.zindex = 9;
                this.content = '';
                this.closeOnOverlayClick = true;
                this.state = 0;
                this.onclose = false;
                this.onbeforeclose = false;
                this.closeOnKeydown = 27;

                this.onKeydown = this.onKeydown.bind(this);

                Object.assign(this, options);

                let modalOptions = {
                    identifier: this.identifier,
                    width: this.width,
                    height: this.height,
                    title: this.title,
                    content: this.content
                };

                document.querySelector('body').insertAdjacentHTML('beforeend', Organizator.Nunjucks.renderString(tpl_base, modalOptions))

                this.content = ''; // Set it free
                this.element = document.querySelector('#' + this.identifier);
                this.closerButtons = this.element.querySelectorAll('.js__modalcloser');
                this.overlay = this.element.querySelector('.mmModal__overlay');
                
                this.bindEvents();
            }

            bindEvents(){
                var self = this;

                if(this.closeOnOverlayClick){
                    this.overlay.addEventListener('click', this.overlayClicked.bind(this));
                }

                if(this.closerButtons.length > 0){
                    this.closerButtons.forEach(element => element.addEventListener('click', this.closerClicked.bind(this)));
                }

                // this.loginButtons.forEach(element => element.addEventListener('click', this.loginButtonClicked.bind(this)));
            }

            setHtml(html){

            }

            closerClicked(event){
                Organizator.applications.ModalManager.remove(this);
            }

            overlayClicked(event){
                let clickedElement = event.target;
                
                if(clickedElement === this.overlay){
                    Organizator.applications.ModalManager.remove(this);
                }
            }

            show(){
                this.state = 1;
                this.element.classList.add('active');

                /*
                 * ModalManager's listenOnKeydown property must be defined here
                 * because if keydown events doesn't work as expected if show() and hide() omitted.
                 */
                if(this.closeOnKeydown !== false){
                   Organizator.applications.ModalManager.listenOnKeydown += 1;
                }
            }

            hide(){
                this.state = 0;
                this.element.classList.remove('active');

                if(this.closeOnKeydown !== false){
                    Organizator.applications.ModalManager.listenOnKeydown -= 1;
                }
            }

            toggle(){
                if(this.state){
                    this.hide();
                }else{
                    this.show();
                }
            }

            onKeydown(event){
                if(event.which == this.closeOnKeydown){

                    if(this.element !== Organizator.applications.ModalManager.modals[Organizator.applications.ModalManager.modals.length - 1].element){
                        return;
                    };

                    document.body.removeEventListener('keydown', this.onKeydown);
                    Organizator.applications.ModalManager.remove(this);
                }
            }
        }
        
        return Modal;
    }
);
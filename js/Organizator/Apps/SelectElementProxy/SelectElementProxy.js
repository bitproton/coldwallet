 define(
    [
        'js/Organizator/Organizator/Application',
        'css!./Resources/css/style'
    ],
    function(
        Organizator_Application
    ){
        class SelectElementProxy extends Organizator_Application {
            constructor(name, element, target, updateFrontFunction = false, neededSpace = 0){
                super('SelectElementProxy_' + name);

                this.element = element;
                this.front = this.element.querySelector('.front');
                this.options = this.element.querySelectorAll('.options .option');
                this.targetElement = target;
                this.targetOptions =this.targetElement.querySelectorAll('option');
                this.updateFront = updateFrontFunction;
                this._state = this.element.classList.contains('.state--open');
                this.neededSpace = neededSpace;

                // positioner is relatively positioned fixed element with overflow:visible
                // it is needed for overlap parent elements with overflow:hidden 
                this.positioner = this.element.querySelector('.optionsContainerPositioner--fixed');
                this.positioner.style.width = this.front.offsetWidth + 'px';
                this.onKeydown = this.onKeydown.bind(this);
                this.onOverlayClick = this.onOverlayClick.bind(this);

                this.bindEvents();
            }

            set state(state){
                this._state = state;

                switch(state){
                    case true:
                        let body = document.body;
                        let html = document.documentElement;
                        let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                        let elementVerticalOffset = this.element.getBoundingClientRect().y;
                        
                        if((documentHeight - elementVerticalOffset) < this.neededSpace){
                            this.element.classList.add('reversed');
                        }else{
                            this.element.classList.remove('reversed');
                        }

                        this.element.classList.add('state--open');
                        document.body.addEventListener('keydown', this.onKeydown);
                        document.body.addEventListener('click', this.onOverlayClick);
                        break;
                    case false:
                        this.element.classList.remove('state--open');
                        document.body.removeEventListener('keydown', this.onKeydown);
                        document.body.removeEventListener('click', this.onOverlayClick);
                        break;
                }

                return this._state;
            }

            get state(){
                return this._state;
            }

            bindEvents(){
                this.front.addEventListener('click', this.frontClicked.bind(this));
                this.options.forEach(element => element.addEventListener('click', this.optionClicked.bind(this)));
            }

            frontClicked(event){
                this.state = !this.state;
            }

            optionClicked(event){
                event.preventDefault();

                let element = event.currentTarget;

                switch(element.getAttribute('data-role')){
                    case 'select-all':
                        for(var option of this.targetOptions){
                            option.selected = true;
                        }
                        break;
                    case 'deselect-all':
                        for(var option of this.targetOptions){
                            option.selected = false;
                        }
                        break;
                    default:
                        var value = element.getAttribute('value');

                        for(var option of this.targetOptions){
                            if(option.value == value){
                                option.selected = true;
                            }else{
                                option.selected = false;
                            }
                        }
                    break;
                }

                this.targetElement.dispatchEvent(new Event('input'));

                if(typeof this.updateFront === 'function'){
                    this.updateFront();
                }

                this.state = false;
            }

            onKeydown(event){
                if(event.which == 27){
                    this.state = false;
                }
            }

            onOverlayClick(event){
                if(event.target !== this.element && (event.path || event.target.parents('*')).indexOf(this.element) === -1){
                    this.state = false;
                }
            }
        }
        
        return SelectElementProxy;
    }
);
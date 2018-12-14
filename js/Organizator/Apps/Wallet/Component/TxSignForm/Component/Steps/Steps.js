 define(
    [
    ],
    function(
    ){
        class Steps {
            constructor(modalElement){
                this.modal = modalElement;
                this.breadcrumbs = this.modal.querySelector('.js__breadcrumbs');
                this.breadcrumbElements = this.breadcrumbs.querySelectorAll('.js__breadcrumb');
                this.stepsSlider = this.modal.querySelector('.js__steps__slider');
                this.stepContentElements = this.stepsSlider.querySelectorAll('.js__step__content');

                this.bindEvents();
            }

            bindEvents(){
                var self = this;

                // this.breadcrumbElements.forEach(function(element){
                    // element.addEventListener('click', self.breadcrumbClicked.bind(self));
                // });

                this.stepsSlider.addEventListener('transitionend', this.normalizeStepsSlider.bind(this));
            }

            normalizeStepsSlider(){
                for(let stepContentElement of this.stepContentElements){
                    if(!stepContentElement.classList.contains('active')){
                        stepContentElement.classList.add('discard');
                    }
                }

                this.stepsSlider.style.height = 'initial';
                this.stepsSlider.style.minHeight = 'initial';
                this.stepsSlider.style.maxHeight = 'initial';
                // this.stepsSlider.style.left = '0%';
            }

            breadcrumbClicked(event){
                event.preventDefault();

                let element = event.currentTarget;
                let step = element.getAttribute('data-step');

                this.jumpToStep(step);
            }

            jumpToStep(step){
                switch(typeof step){
                    case 'string':
                        var breadcrumbElement = this.breadcrumbs.querySelector('[data-step="' + step + '"]');
                        var stepName = step;
                        break;
                    case 'element':
                        var breadcrumbElement = step;
                        var stepName = step.getAttribute('data-step');
                        break;
                }

                let activeStepContentElement = this.modal.querySelector('.js__step__content.active');
                
                this.stepsSlider.style.height = activeStepContentElement.offsetHeight + 'px';

                for(let _stepContentElement of this.stepContentElements){
                    _stepContentElement.classList.remove('discard');
                }

                for(let breadcrumb of this.breadcrumbElements){
                    if(breadcrumbElement === breadcrumb){
                        breadcrumbElement.classList.add('active');
                    }else{
                        breadcrumb.classList.remove('active');
                    }
                }

                let stepContentElement = this.modal.querySelector('.step__content[data-step="' + stepName + '"]');
                let stepContentElementIndex = this._getElementIndex(stepContentElement);
                let stepContentElementHeight = stepContentElement.offsetHeight;

                for(let _stepContentElement of this.stepContentElements){
                    if(stepContentElement === _stepContentElement){
                        stepContentElement.classList.add('active');
                        stepContentElement.classList.remove('discard');
                    }else{
                        _stepContentElement.classList.remove('active');
                        _stepContentElement.classList.add('discard');
                    }
                }

                this.stepsSlider.style.left = (-100 * stepContentElementIndex) + '%';
                this.stepsSlider.style.height = stepContentElementHeight + 'px';
            }

            _getElementIndex(element){
                let parent = element.parentElement;
                let childCount = parent.children.length;

                for(let i = 0; i < childCount; i++){
                    if(element === parent.children[i]){
                        return i;
                    }
                }

                return false;
            }
        }
        
        return Steps;
    }
);
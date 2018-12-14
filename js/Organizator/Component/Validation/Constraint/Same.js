define(
    [
        'js/Organizator/Organizator',
        'js/Organizator/Component/Validation/Constraint',
        'js/Organizator/Component/Validation/ConstraintValidationResultBuilder'
    ],
    function(
        Organizator,
        Organizator_Validation_Constraint,
        Organizator_Validation_ConstraintValidationResultBuilder
    ){
        class Organizator_Validation_Constraint_Same extends Organizator_Validation_Constraint {
            constructor(options) {
                super();
                Object.assign(this, options);

                this.targetElement = document.querySelector(this.with);

                this.messages['NOT_SAME_ERROR'] = 'Passwords doesn\'t match.';
                this.messages['SAME_SUCCESS'] = 'This value is valid.';
            }

            static getName(){
                return 'same';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(this.base=='true'){
                    this.targetElement.dispatchEvent(new Event('input'));
                }else{  
                    if(value == this.targetElement.value){
                        resultBuilder.addSuccess(this.messages['SAME_SUCCESS']);
                    }else{
                        resultBuilder.addError(this.messages['NOT_SAME_ERROR']);
                    }
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_Same);
        
        return Organizator_Validation_Constraint_Same;
    }
);

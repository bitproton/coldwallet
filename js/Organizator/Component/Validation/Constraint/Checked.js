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
        class Organizator_Validation_Constraint_Checked extends Organizator_Validation_Constraint {
            constructor() {
                super();

                this.messages['ERROR_NOT_VALID'] = 'This field must be checked.';
                this.messages['SUCCESS_VALID'] = 'This field is valid.';
            }

            static getName(){
                return 'checked';
            }

            validate(value, element) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(!element.checked){
                    resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
                }else{
                    resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_Checked);
        
        return Organizator_Validation_Constraint_Checked;
    }
);

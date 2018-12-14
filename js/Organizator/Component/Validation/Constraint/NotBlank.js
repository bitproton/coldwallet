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
        class Organizator_Validation_Constraint_NotBlank extends Organizator_Validation_Constraint {
            constructor() {
                super();

                this.messages['ERROR_NOT_VALID'] = 'This value must not be empty.';
                this.messages['SUCCESS_VALID'] = 'This value %value% is a valid.';
            }

            static getName(){
                return 'notblank';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(value == ''){
                    resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
                }else{
                    resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_NotBlank);
        
        return Organizator_Validation_Constraint_NotBlank;
    }
);

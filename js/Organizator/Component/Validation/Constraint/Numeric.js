/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation/Constraint
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Organizator',
        'js/Organizator/Component/Validation/Constraint',
        'js/Organizator/Component/Validation/ConstraintValidationResultBuilder'
    ],
    function(
        Organizator,
        Organizator_Validation_Constraint,
        Organizator_Validation_ConstraintValidationResultBuilder,
    ){ 
        class Organizator_Validation_Constraint_Numeric extends Organizator_Validation_Constraint {
            constructor() {
                super();

                this.regex = /^[0-9]+$/;

                this.messages['ERROR_NOT_VALID'] = 'This value is not numeric.';
                this.messages['SUCCESS_VALID'] = 'This value is numeric.';
            }

            static getName(){
                return 'numeric';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(!this.regex.test(value)){
                    resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
                }else{
                    resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_Numeric);
        
        return Organizator_Validation_Constraint_Numeric;
    }
);

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
        Organizator_Validation_ConstraintValidationResultBuilder
    ){
        class Organizator_Validation_Constraint_Email extends Organizator_Validation_Constraint {
            constructor(strict) {
                super();

                this.regex = /^.+\@\S+\.\S+$/;
                this.strict = strict;

                this.messages['ERROR_NOT_VALID'] = 'This value is not a valid email address.';
                this.messages['SUCCESS_VALID'] = 'This value %value% is a valid email address.';
                this.messages['WARNING_MX_NOT_CHECKED'] = 'This value %string% is a valid url record checks are also needed.';
            }

            static getName(){
                return 'email';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(!this.regex.test(value)){
                    resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
                }else{
                    resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);

                    if(!this.strict){
                        resultBuilder.addWarning(this.messages['WARNING_MX_NOT_CHECKED']);
                    }
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_Email);
        
        return Organizator_Validation_Constraint_Email;
    }
);

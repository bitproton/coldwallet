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
        class Organizator_Validation_Constraint_Url extends Organizator_Validation_Constraint {
            constructor() {        
                super();

                this.messages['ERROR_NOT_VALID'] = 'This value is not a valid url.';
                this.messages['SUCCESS_VALID'] = 'This value %value% is a valid url.';
                this.messages['WARNING_MX_NOT_CHECKED'] = 'This value %string% is a valid email address but MX record checks are also needed.';

                this.regex = /(([\w\.\-\+]+:)\/{2}(([\w\d\.]+):([\w\d\.]+))?@?(([a-zA-Z0-9\.\-_]+)(?::(\d{1,5}))?))?(\/(?:[a-zA-Z0-9\.\-\/\+\%]+)?)(?:\?([a-zA-Z0-9=%\-_\.\*&;]+))?(?:#([a-zA-Z0-9\-=,&%;\/\\"'\?]+)?)?/;
                this.isStrict = false;
            }

            static getName(){
                return 'url';
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
        
        Organizator.Validator.addConstraint(Organizator_Validation_Constraint_Url);
        
        return Organizator_Validation_Constraint_Url;
    }
);
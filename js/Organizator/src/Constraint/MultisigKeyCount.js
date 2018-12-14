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
        class Organizator_src_Constraint_MultisigKeyCount extends Organizator_Validation_Constraint {
            constructor(options) {        
                super();

                Object.assign(this, options);

                this.min = 1;
                this.max = document.querySelectorAll('[name^="' + this.maxByFormField + '"]').length || 1;

                this.messages['VALID'] = 'This field is valid';
                this.messages['INVALID_MIN'] = 'At least ' + this.min + ' key required.';
                this.messages['INVALID_MAX'] = 'Required key count must not exceed the total number of keys (' + this.max + ').';
            }

            static getName(){
                return 'multisigkeycount';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                if(parseInt(value) < this.min){
                    resultBuilder.addError(this.messages['INVALID_MIN']);
                }else{
                    if(parseInt(value) > this.max){
                        resultBuilder.addError(this.messages['INVALID_MAX']);
                    }else{
                         resultBuilder.addSuccess(this.messages['VALID']);
                    }
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_src_Constraint_MultisigKeyCount);
        
        return Organizator_src_Constraint_MultisigKeyCount;
    }
);
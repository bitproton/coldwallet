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
        class Organizator_src_Constraint_Password extends Organizator_Validation_Constraint {
            constructor() {        
                super();

                this.messages['INVALID'] = 'Password is invalid.';
                this.messages['VALID'] = 'Password is valid.';
            }

            static getName(){
                return 'password';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                try{
                    if(sjcl.decrypt(value, Organizator.applications.Auth.auth.password) === Organizator.applications.Auth.message){
                        resultBuilder.addSuccess(this.messages['VALID']);
                    }else{
                        resultBuilder.addError(this.messages['INVALID']);
                    }
                }catch($e){
                    resultBuilder.addError(this.messages['INVALID']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_src_Constraint_Password);
        
        return Organizator_src_Constraint_Password;
    }
);
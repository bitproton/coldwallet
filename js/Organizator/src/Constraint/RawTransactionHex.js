define(
    [
        'js/Organizator/Organizator',
        'js/Organizator/Component/Validation/Constraint',
        'js/Organizator/Component/Validation/ConstraintValidationResultBuilder',
        'js/node_modules/bitcoinjs-lib/dist/bitcoinjs-lib.min'
    ],
    function(
        Organizator,
        Organizator_Validation_Constraint,
        Organizator_Validation_ConstraintValidationResultBuilder,
        bitcoinjs
    ){ 
        class Organizator_src_Constraint_RawTransactionHex extends Organizator_Validation_Constraint {
            constructor() {        
                super();

                this.messages['NOT_VALID'] = 'Bad formatted transaction.';
                this.messages['VALID'] = 'This value is a valid raw transaction hex.';
            }

            static getName(){
                return 'rawtransactionhex';
            }

            validate(value) {
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                try{
                    let tx = bitcoinjs.Transaction.fromHex(value);
                    resultBuilder.addSuccess(this.messages['VALID']);
                }catch(e){
                    resultBuilder.addError(this.messages['NOT_VALID']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_src_Constraint_RawTransactionHex);
        
        return Organizator_src_Constraint_RawTransactionHex;
    }
);
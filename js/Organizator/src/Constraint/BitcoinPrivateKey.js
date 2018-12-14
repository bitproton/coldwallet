define(
    [
        'js/Organizator/Organizator',
        'js/Organizator/Component/Validation/Constraint',
        'js/Organizator/Component/Validation/ConstraintValidationResultBuilder',
        'js/node_modules/bitcoinjs-lib/dist/bitcoinjs-lib.min',
    ],
    function(
        Organizator,
        Organizator_Validation_Constraint,
        Organizator_Validation_ConstraintValidationResultBuilder,
        bitcoinjs
    ){
        class Organizator_src_Constraint_BitcoinPrivateKey extends Organizator_Validation_Constraint {
            constructor(){
                super();

                this.messages['NOT_BITCOIN_PRIVATEKEY_ERROR'] = 'This is not a bitcoin private key.';
                this.messages['BITCOIN_PRIVATEKEY_SUCCESS'] = 'This is a valid bitcoin private key.';
            }

            static getName(){
                return 'bitcoinprivatekey';
            }

            validate(value){
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                try{
                    bitcoinjs.ECPair.fromWIF(value);
                    resultBuilder.addSuccess(this.messages['BITCOIN_PRIVATEKEY_SUCCESS']);
                }catch($e){
                    resultBuilder.addError(this.messages['NOT_BITCOIN_PRIVATEKEY_ERROR']);
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_src_Constraint_BitcoinPrivateKey);
        
        return Organizator_src_Constraint_BitcoinPrivateKey;
    }
);
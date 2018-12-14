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
        class Organizator_src_Constraint_BitcoinAddress extends Organizator_Validation_Constraint {
            constructor(){
                super();

                this.messages['NOT_BITCOIN_ADDRESS_ERROR'] = 'This value is not a valid bitcoin address.';
                this.messages['BECH32_ERROR'] = 'Bech32 addresses are not supported yet.';
                this.messages['BITCOIN_ADDRESS_SUCCESS'] = 'This value is a valid bitcoin address.';
            }

            static getName(){
                return 'bitcoinaddress';
            }

            validate(value){
                var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

                resultBuilder.setValue(value);

                try{
                    bitcoinjs.address.fromBase58Check(value);
                    resultBuilder.addSuccess(this.messages['BITCOIN_ADDRESS_SUCCESS']);
                }catch($e){
                    try{
                        bitcoinjs.address.fromBech32(value);
                        resultBuilder.addError(this.messages['BECH32_ERROR']);
                    }catch($e){
                        resultBuilder.addError(this.messages['NOT_BITCOIN_ADDRESS_ERROR']);
                    }
                }

                return resultBuilder.getResult();
            }
        }
        
        Organizator.Validator.addConstraint(Organizator_src_Constraint_BitcoinAddress);
        
        return Organizator_src_Constraint_BitcoinAddress;
    }
);
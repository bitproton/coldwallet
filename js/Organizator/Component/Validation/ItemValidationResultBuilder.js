/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Component/Validation/ItemValidationResult'
    ],
    function(
    	Organizator_Validation_ItemValidationResult
    ){
        class Organizator_Validation_ItemValidationResultBuilder {
            constructor(){
                this.item = null;
                this.value = null;
                this.isValid = true;
                this.errorCount = 0;
                this.constraints = {};
            }

            addResult(constraintName, itemValidationResult){
                this.constraints[constraintName] = itemValidationResult;

                if(!itemValidationResult.isValid){
                    this.errorCount++;
                }
            }

            reset(){
                this.item = null;
                this.value = null;
                this.isValid = true;
                this.errorCount = 0;
                this.constraints = {};
            }

            setIsValid(isValid){
                this.isValid = isValid;
            }

            setItem(item){
                this.item = item;
            }

            setValue(value){
                this.value = value;
            }

            getResult(){
                var result = new Organizator_Validation_ItemValidationResult({
                    item: this.item,
                    value: this.value,
                    isValid: this.isValid,
                    errorCount: this.errorCount,
                    constraints: this.constraints
                });

                return result;
            }
        }
        
        return Organizator_Validation_ItemValidationResultBuilder;
    }
);
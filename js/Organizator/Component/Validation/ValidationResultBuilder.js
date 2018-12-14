/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Component/Validation/ValidationResult'
    ],
    function(
        Organizator_Validation_ValidationResult
    ){
        class Organizator_Validation_ValidationResultBuilder {
            constructor(){
                this.isValid = true;
                this.errorCount = 0;
                this.results = [];
            }

            addResult(itemValidationResult){
                this.results.push(itemValidationResult);

                if(!itemValidationResult.isValid){
                    this.errorCount++;
                }
            }

            calculate(){
                this.isValid = this.errorCount ? false : true;
            }

            setValue(value){
                this.value = value;
            }

            getResult(){
                this.calculate();

                var result = new Organizator_Validation_ValidationResult({
                    isValid: this.isValid,
                    errorCount: this.errorCount,
                    results: this.results
                });

                return result;
            }
        } 
       
       return Organizator_Validation_ValidationResultBuilder;
    }
);
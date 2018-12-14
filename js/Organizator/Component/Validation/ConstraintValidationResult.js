/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(function(){
    class Organizator_Validation_ConstraintValidationResult {
        constructor(options){
            this.value = options.value || null;
            this.isValid = options.isValid;
            this.errors = options.errors || [];
            this.warnings = options.warnings || [];
            this.successes = options.successes || [];
        }
    }

    return Organizator_Validation_ConstraintValidationResult;
});
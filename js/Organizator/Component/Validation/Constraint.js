/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(function(){
    class Organizator_Validation_Constraint {
        constructor(options){
            this.name = '';
            this.messages = {};
        }
    }
    
    return Organizator_Validation_Constraint;
});
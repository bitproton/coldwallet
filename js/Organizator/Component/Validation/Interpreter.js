/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Component/Validation/ItemValidationResultBuilder'
    ],
    function(
        Organizator_Validation_ItemValidationResultBuilder
    ){
       class Organizator_Validation_Interpreter {
            constructor(input, value, element, property) {
                this.property = property || null;
                this.element = element || null;
                this.input = input || '';
                this.value = value || '';
                this.itemValidationResultBuilder = new Organizator_Validation_ItemValidationResultBuilder();
            }

            getResult(){
                return this.itemValidationResultBuilder.getResult();
            }

            reset(){
                this.item = null;
                this.input = '';
                this.value = '';
                this.itemValidationResultBuilder.reset();
            }

            setItem(item){
                this.item = item;
                this.itemValidationResultBuilder.setItem(item);
            }

            setInput(input) {
                this.input = input;
            }

            setValue(value) {
                this.value = value;
                this.itemValidationResultBuilder.setValue(value);
            }
            
            setIsValid(isValid){
                this.itemValidationResultBuilder.setIsValid(isValid);
            }

            traverse(node, rootCommand){
                for(let i = 0; i < node.value.length; i++){
                    let subNode = node.value[i];
                    switch(subNode.type){
                        case 'group':
                            this.traverse(subNode);
                            node.value[i] = subNode.value;
                            break;
                        case 'operation':
                            node.value[i] = this.operate(subNode);
                            break;
                        case 'rule':
                            node.value[i] = this.validateRule(subNode);
                            break;
                    }
                }

                if(rootCommand){
                    this.input = node;
                    this.setIsValid(node.value[0].value);
                }
            }

            operate(node){
                let operator = node.value.filter(function(i){return i.type == 'operator';})[0];
                let operands = node.value.filter(function(i){return i.type != 'operator';});

                for(let i = 0; i < operands.length; i++){
                    let operand = operands[i];

                    switch(operands[i].type){
                        case 'operation':
                            operands[i] = this.operate(operands[i]);
                            break;
                        case 'group':
                            operands[i] = this.traverse(operands[i]);
                            break;
                        case 'rule':
                            operands[i] = this.validateRule(operands[i]);
                            break;
                    }
                }

                switch(operator.value){
                    case '&&':
                        return {
                            type: 'operationResult',
                            value: operands[0].value && operands[1].value
                        };
                        break;
                    case '||':
                        return {
                            type: 'operationResult',
                            value: operands[0].value || operands[1].value
                        };
                        break;
                }
            }

            validateRule(node){
                let constraintName = node.name;
                let constraintArguments = node.arguments;
                let constraint = new Organizator.Validator.constraints[constraintName](constraintArguments);
                let constraintValidationResult = constraint.validate(this.value, this.item);
                
                this.itemValidationResultBuilder.addResult(constraintName, constraintValidationResult);

                return {
                    type: 'operationResult',
                    value: constraintValidationResult.isValid
                }
            }

            /*
             * @return Organizator_Validation_ItemValidationResult
             */
            run(){
                this.traverse(this.input, true);
                return this.getResult();
            }
        }
        
        return Organizator_Validation_Interpreter;
    }
);
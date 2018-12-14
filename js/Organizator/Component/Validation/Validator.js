/*
 * Validation component
 * 
 * @namespace Organizator/Component/Validation
 * @author Emre Alper Özdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Component/Nearley/Nearley',
        'js/Organizator/Component/Validation/Grammar',
        'js/Organizator/Component/Validation/ValidationResultBuilder',
        'js/Organizator/Component/Validation/Interpreter'
    ],
    function (
        Organizator_Nearley,
        Organizator_Validation_Grammar,
        Organizator_Validation_ValidationResultBuilder,
        Organizator_Validation_Interpreter
        ) {
        class Organizator_Validation_Validator {
            constructor() {
                this.constraints = {};
            }

            addConstraint(constraint) {
                this.constraints[constraint.getName()] = constraint;
            }

            getConstraint(constraintName) {
                return this.constraints[constraintName];
            }

            validateHTMLElement(element, rules, grammar, parser, interpreter) {
                grammar = grammar || new Organizator_Validation_Grammar();
                parser = parser || new Organizator_Nearley.Organizator_Nearley_Parser(grammar.grammar.ParserRules, grammar.grammar.ParserStart);
                interpreter = interpreter || new Organizator_Validation_Interpreter();

                rules = rules || element.getAttribute('org-validate');

                let value = element.value;

                let validationInput = parser.feed(rules).results[0];
                
                interpreter.setInput(validationInput);
                interpreter.setValue(value);
                interpreter.setItem(element);

                let itemValidationResult = interpreter.run();

                return itemValidationResult;
            }

            validateForm(form) {
                let inputElements = form.querySelectorAll('[org-validate]');
                let validationResultBuilder = new Organizator_Validation_ValidationResultBuilder();
                let grammar = new Organizator_Validation_Grammar();
                let interpreter = new Organizator_Validation_Interpreter();

                for (var element of inputElements) {
                    if(element.hasAttribute('org-novalidate')){continue;}
                    
                    interpreter.reset();
                    let parser = new Organizator_Nearley.Organizator_Nearley_Parser(grammar.grammar.ParserRules, grammar.grammar.ParserStart);
                    let itemValidationResult = this.validateHTMLElement(element, null, grammar, parser, interpreter);

                    validationResultBuilder.addResult(itemValidationResult);
                }

                let validationResult = validationResultBuilder.getResult();

                return validationResult;
            }

            validateHTMLGroup(htmlElement) {
                return this.validateForm(htmlElement);
            }

            validateProperty(value, name, rules, grammar, parser, interpreter) {
                grammar = grammar || new Organizator_Validation_Grammar();
                parser = parser || new Organizator_Nearley.Organizator_Nearley_Parser(grammar.grammar.ParserRules, grammar.grammar.ParserStart);
                interpreter = interpreter || new Organizator_Validation_Interpreter();

                let validationInput = parser.feed(rules).results[0];

                interpreter.setInput(validationInput);
                interpreter.setValue(value);
                interpreter.setItem(name);

                let itemValidationResult = interpreter.run();

                return itemValidationResult;
            }

            validateObject(object, rules) {
                var validationRules = rules || object.OrganizatorValidationRules || null;
                var validationResultBuilder = new Organizator_Validation_ValidationResultBuilder();
                let grammar = new Organizator_Validation_Grammar();
                let interpreter = new Organizator_Validation_Interpreter();

                if (!validationRules) {
                    return true;
                }

                for (var property in validationRules) {
                    if (!object[property]) {
                        continue;
                    }

                    interpreter.reset();

                    let parser = new Organizator_Nearley.Organizator_Nearley_Parser(grammar.grammar.ParserRules, grammar.grammar.ParserStart);
                    let itemValidationResult = this.validateProperty(object[property], property, validationRules[property], grammar, parser, interpreter);

                    validationResultBuilder.addResult(itemValidationResult);
                }

                let validationResult = validationResultBuilder.getResult();

                return validationResult;
            }

            validateQueryString(queryString, rules) {
                var object = new Organizator_Util_QueryStringParser()._parseQueryString(queryString);
                console.log(object);
                return this.validateObject(object, rules);
            }

            validateValue(value, constraint) {
                if (this.constraints[constraint] === undefined) {
                    return;
                }
                return new this.constraints[constraint](null).validate(value);
            }
        }

        return Organizator_Validation_Validator;
    }
);
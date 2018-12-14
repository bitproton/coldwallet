define(
    [
        'exports',
        'js/Organizator/Component/Nearley/Parser',
        'js/Organizator/Component/Nearley/State'
    ],
    function(
        exports,
        Organizator_Nearley_Parser,
        Organizator_Nearley_State
    ){
        class Organizator_Nearley_Column {
            constructor(grammar, index) {
                this.grammar = grammar;
                this.index = index;
                this.states = [];
                this.wants = {}; // states indexed by the non-terminal they expect
                this.scannable = []; // list of states that expect a token
                this.completed = {}; // states that are nullable
            }

            process(nextColumn) {
                const states = this.states;
                const wants = this.wants;
                const completed = this.completed;

                // nb. we push() during iteration
                for (const state of states) {
                    if (state.isComplete) {
                        state.finish();
                        if (state.data !== Organizator_Nearley_Parser.fail) {
                            // complete
                            const wantedBy = state.wantedBy;
                            for (var i = wantedBy.length; i--; ) { // this line is hot
                                const left = wantedBy[i];
                                this.complete(left, state);
                            }

                            // special-case nullables
                            if (state.reference === this.index) {
                                // make sure future predictors of this rule get completed. 
                                var exp = state.rule.name;
                                (this.completed[exp] = this.completed[exp] || []).push(state);
                            }
                        }

                    } else {
                        // queue scannable states
                        var exp = state.rule.symbols[state.dot];
                        if (typeof exp !== 'string') {
                            this.scannable.push(state);
                            continue;
                        }

                        // predict
                        if (wants[exp]) {
                            wants[exp].push(state);

                            if (completed.hasOwnProperty(exp)) {
                                const nulls = completed[exp];
                                for (var i = 0; i < nulls.length; i++) {
                                    const right = nulls[i];
                                    this.complete(state, right);
                                }
                            }
                        } else {
                            wants[exp] = [state];
                            this.predict(exp);
                        }
                    }
                }
            }

            predict(exp) {
                const rules = this.grammar.byName[exp] || [];

                for (const r of rules) {
                    const wantedBy = this.wants[exp];
                    const s = new Organizator_Nearley_State(r, 0, this.index, wantedBy);
                    this.states.push(s);
                }
            }

            complete(left, right) {
                const inp = right.rule.name;
                if (left.rule.symbols[left.dot] === inp) {
                    const copy = left.nextState(right.data);
                    this.states.push(copy);
                }
            }
        }
        
        exports.Organizator_Nearley_Column = Organizator_Nearley_Column;
    }
);
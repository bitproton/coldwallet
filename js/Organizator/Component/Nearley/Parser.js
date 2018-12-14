define(
    [
        'exports',
        'js/Organizator/Component/Nearley/Grammar',
        'js/Organizator/Component/Nearley/Column'
    ],
    function(
        exports,
        Organizator_Nearley_Grammar,
        Organizator_Nearley_Column
    ){
        class Organizator_Nearley_Parser {
            constructor(rules, start, options) {
                if (rules instanceof Organizator_Nearley_Grammar) {
                    var grammar = rules;
                    var options = start;
                } else {
                    var grammar = Organizator_Nearley_Grammar.fromCompiled(rules, start);
                }
                this.grammar = grammar;

                // Read options
                this.options = {
                    keepHistory: false,
                };
                for (const key in (options || {})) {
                    this.options[key] = options[key];
                }

                // Setup a table
                const column = new Organizator_Nearley_Column(grammar, 0);
                const table = this.table = [column];

                // I could be expecting anything.
                column.wants[grammar.start] = [];
                column.predict(grammar.start);
                // TODO what if start rule is nullable?
                column.process();
                this.current = 0;
            }

            feed(chunk) {
                for (var chunkPos = 0; chunkPos < chunk.length; chunkPos++) {
                    // We add new states to table[current+1]
                    const column = this.table[this.current + chunkPos];

                    // GC unused states
                    if (!this.options.keepHistory) {
                        delete this.table[this.current + chunkPos - 1];
                    }

                    const n = this.current + chunkPos + 1;
                    const nextColumn = new Organizator_Nearley_Column(this.grammar, n);
                    this.table.push(nextColumn);

                    // Advance all tokens that expect the symbol
                    // So for each state in the previous row,

                    const token = chunk[chunkPos];
                    const scannable = column.scannable;
                    for (let w = scannable.length; w--; ) {
                        const state = scannable[w];
                        const expect = state.rule.symbols[state.dot];
                        // Try to consume the token
                        // either regex or literal
                        if (expect.test ? expect.test(token) : expect.literal === token) {
                            // Add it
                            const next = state.nextState(token);
                            nextColumn.states.push(next);
                        }
                    }

                    // Next, for each of the rules, we either
                    // (a) complete it, and try to see if the reference row expected that
                    //     rule
                    // (b) predict the next nonterminal it expects by adding that
                    //     nonterminal's start state
                    // To prevent duplication, we also keep track of rules we have already
                    // added

                    nextColumn.process();

                    // If needed, throw an error:
                    if (nextColumn.states.length === 0) {
                        // No states at all! This is not good.
                        const err = new Error(
                                `nearley: No possible parsings (@${this.current + chunkPos}: '${chunk[chunkPos]}').`
                                );
                        err.offset = this.current + chunkPos;
                        throw err;
                    }
                }

                this.current += chunkPos;

                // Incrementally keep track of results
                this.results = this.finish();

                // Allow chaining, for whatever it's worth
                return this;
            }

            finish() {
                // Return the possible parsings
                const considerations = [];
                const start = this.grammar.start;
                const column = this.table[this.table.length - 1];
                column.states.forEach(t => {
                    if (t.rule.name === start
                            && t.dot === t.rule.symbols.length
                            && t.reference === 0
                            && t.data !== Organizator_Nearley_Parser.fail) {
                        considerations.push(t);
                    }
                });
                return considerations.map(c => c.data);
            }
            
            static get fail() {
                Organizator_Nearley_Parser.MY_CONST;
            }
        }

        Organizator_Nearley_Parser.fail = {};
        
        exports.Organizator_Nearley_Parser = Organizator_Nearley_Grammar;
    }
);

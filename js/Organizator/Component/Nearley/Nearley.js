define(function(){
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

    class Organizator_Nearley_Grammar {
        constructor(rules, start) {
            this.rules = rules;
            this.start = start || this.rules[0].name;
            const byName = this.byName = {};
            this.rules.forEach(rule => {
                if (!byName.hasOwnProperty(rule.name)) {
                    byName[rule.name] = [];
                }
                byName[rule.name].push(rule);
            });
        }

        // So we can allow passing (rules, start) directly to Parser for backwards compatibility
        static fromCompiled(rules, start) {
            if (rules.ParserStart) {
                start = rules.ParserStart;
                rules = rules.ParserRules;
            }
            var rules = rules.map(r => new Organizator_Nearley_Rule(r.name, r.symbols, r.postprocess));
            return new Organizator_Nearley_Grammar(rules, start);
        }
    }

    class Organizator_Nearley_State {
        constructor(rule, dot, reference, wantedBy) {
            this.rule = rule;
            this.dot = dot;
            this.reference = reference;
            this.data = [];
            this.wantedBy = wantedBy;
            this.isComplete = this.dot === rule.symbols.length;
        }

        toString() {
            return `{${this.rule.toString(this.dot)}}, from: ${this.reference || 0}`;
        }

        nextState(data) {
            const state = new Organizator_Nearley_State(this.rule, this.dot + 1, this.reference, this.wantedBy);
            state.left = this;
            state.right = data;
            if (state.isComplete) {
                state.data = state.build();
            }
            return state;
        }

        build() {
            const children = [];
            let node = this;
            do {
                children.push(node.right);
                node = node.left;
            } while (node.left);
            children.reverse();
            return children;
        }

        finish() {
            if (this.rule.postprocess) {
                this.data = this.rule.postprocess(this.data, this.reference, Organizator_Nearley_Parser.fail);
            }
        }
    }

    class Organizator_Nearley_Rule {
        constructor(name, symbols, postprocess) {
            this.id = ++Organizator_Nearley_Rule.highestId;
            this.name = name;
            this.symbols = symbols;        // a list of literal | regex class | nonterminal
            this.postprocess = postprocess;
            return this;
        }

        toString(withCursorAt) {
            function stringifySymbolSequence (e) {
                return (e.literal) ? JSON.stringify(e.literal)
                                   : e.toString();
            }
            const symbolSequence = (typeof withCursorAt === "undefined")
                                 ? this.symbols.map(stringifySymbolSequence).join(' ')
                                 : (   `${this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ')} â—? ${this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ')}`     );
            return `${this.name} â†’ ${symbolSequence}`;
        }
    }

    Organizator_Nearley_Rule.highestId = 0;

	return {
		Organizator_Nearley_Parser: Organizator_Nearley_Parser,
		Organizator_Nearley_Column: Organizator_Nearley_Column,
		Organizator_Nearley_Grammar: Organizator_Nearley_Grammar,
		Organizator_Nearley_State: Organizator_Nearley_State,
		Organizator_Nearley_Rule: Organizator_Nearley_Rule
	};
});
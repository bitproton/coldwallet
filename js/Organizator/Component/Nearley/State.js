define(
    [
        'exports',
        'js/Organizator/Component/Nearley/Parser'
    ],
    function(
        exports,
        Organizator_Nearley_Parser
    ){
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
        
        exports.Organizator_Nearley_State = Organizator_Nearley_State;
    }
);

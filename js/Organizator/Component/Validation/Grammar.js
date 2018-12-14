define(function(){
    class Organizator_Validation_Grammar {
        constructor() {
            this.grammar = {
                ParserRules: [
                    {"name": "program", "symbols": ["expr"], "postprocess":
                                function (d) {
                                    return {
                                        type: 'program',
                                        value: d
                                    }
                                }
                    },
                    {"name": "expr", "symbols": [{"literal": "("}, "_", "expr", "_", {"literal": ")"}], "postprocess":
                                function (d) {
                                    return d[2];
                                }
                    },
                    {"name": "expr", "symbols": ["expr", "_", "op", "_", "expr"], "postprocess":
                                function (d) {
                                    let f = d.filter(function (i) {
                                        return i !== null
                                    });

                                    return {
                                        type: 'operation',
                                        value: f
                                    }
                                }
                    },
                    {"name": "expr", "symbols": ["rule"], "postprocess": this.id},
                    {"name": "rule$ebnf$1", "symbols": [/[a-z]/]},
                    {"name": "rule$ebnf$1", "symbols": ["rule$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "rule", "symbols": [{"literal": "@"}, "rule$ebnf$1", "_", {"literal": "("}, "_", "args", "_", {"literal": ")"}], "postprocess":
                                function (d) {
                                    let o = {};

                                    for (var i = 0; i < d[5].length; i++) {
                                        o = Object.assign(o, d[5][i]);
                                    }

                                    return {
                                        type: 'rule',
                                        name: d[1].join(''),
                                        arguments: o
                                    }
                                }
                    },
                    {"name": "rule$ebnf$2", "symbols": [/[a-z]/]},
                    {"name": "rule$ebnf$2", "symbols": ["rule$ebnf$2", /[a-z]/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "rule", "symbols": [{"literal": "@"}, "rule$ebnf$2", "_", {"literal": "("}, "_", {"literal": ")"}], "postprocess":
                                function (d) {
                                    return {
                                        type: 'rule',
                                        name: d[1].join(''),
                                        arguments: null
                                    }
                                }
                    },
                    {"name": "rule$ebnf$3", "symbols": [/[a-z]/]},
                    {"name": "rule$ebnf$3", "symbols": ["rule$ebnf$3", /[a-z]/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "rule", "symbols": [{"literal": "@"}, "rule$ebnf$3"], "postprocess":
                                function (d) {
                                    return {
                                        type: 'rule',
                                        name: d[1].join(''),
                                        arguments: null
                                    }
                                }
                    },
                    {"name": "args", "symbols": ["args", "_", {"literal": ","}, "_", "arg"], "postprocess":
                                function (d) {
                                    let args = [];

                                    for (var i = 0; i < d[0].length; i++) {
                                        args = args.concat(d[0][i]);
                                    }

                                    args = args.concat(d[4]);
                                    return args;
                                }
                    },
                    {"name": "args", "symbols": ["arg"], "postprocess":
                                function (d) {
                                    return [d[0]];
                                }
                    },
                    {"name": "arg", "symbols": ["argkey", "_", {"literal": "="}, "_", "argval"], "postprocess":
                                function (d) {
                                    let o = {};
                                    o[d[0]] = d[4];

                                    return o;
                                }
                    },
                    {"name": "argkey", "symbols": ["word"], "postprocess": this.id},
                    {"name": "argval", "symbols": ["word"], "postprocess": this.id},
                    {"name": "word$ebnf$1", "symbols": [/[^\s=(),'"]/]},
                    {"name": "word$ebnf$1", "symbols": ["word$ebnf$1", /[^\s=(),'"]/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "word", "symbols": ["word$ebnf$1"], "postprocess":
                                function (d) {
                                    return d[0].join('');
                                }
                    },
                    {"name": "word$ebnf$2", "symbols": [/[^"]/]},
                    {"name": "word$ebnf$2", "symbols": ["word$ebnf$2", /[^"]/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "word", "symbols": [{"literal": "\""}, "word$ebnf$2", {"literal": "\""}], "postprocess":
                                function (d) {
                                    return d[1].join('');
                                }
                    },
                    {"name": "word$ebnf$3", "symbols": [/[^']/]},
                    {"name": "word$ebnf$3", "symbols": ["word$ebnf$3", /[^']/], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "word", "symbols": [{"literal": "'"}, "word$ebnf$3", {"literal": "'"}], "postprocess":
                                function (d) {
                                    return d[1].join('');
                                }
                    },
                    {"name": "op$string$1", "symbols": [{"literal": "&"}, {"literal": "&"}], "postprocess": function joiner(d) {
                            return d.join('');
                        }},
                    {"name": "op", "symbols": ["op$string$1"], "postprocess":
                                function (d) {
                                    return {
                                        type: 'operator',
                                        value: d[0]
                                    }
                                }
                    },
                    {"name": "op$string$2", "symbols": [{"literal": "|"}, {"literal": "|"}], "postprocess": function joiner(d) {
                            return d.join('');
                        }},
                    {"name": "op", "symbols": ["op$string$2"], "postprocess":
                                function (d) {
                                    return {
                                        type: 'operator',
                                        value: d[0]
                                    }
                                }
                    },
                    {"name": "_$ebnf$1", "symbols": []},
                    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function (d) {
                            return null;
                        }},
                    {"name": "__$ebnf$1", "symbols": ["wschar"]},
                    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {
                            return d[0].concat([d[1]]);
                        }},
                    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function (d) {
                            return null;
                        }},
                    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": this.id}
                ]
                , ParserStart: "program"
            };
        }

        id(x) {
            return x[0];
        }
    }

    return Organizator_Validation_Grammar;
});
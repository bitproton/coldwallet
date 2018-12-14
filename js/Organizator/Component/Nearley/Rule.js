define(
    [
        'exports'
    ], 
    function(
        exports
    ){
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
    
    exports.Organizator_Nearley_Rule = Organizator_Nearley_Rule;
});
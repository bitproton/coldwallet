/*
 * RouteCompiler is a part of Routing component.
 * It compiles a Route and register it to the application.
 * 
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(
    [
        'js/Organizator/Component/Routing/Route'
    ], 
    function(
        Organizator_Routing_Route
    ){
    class Organizator_Routing_RouteCompiler {
        constructor() {
            this.parameterPattern = /(?:\{)([^}]+)(?:\})/g,

            this.emptyRoute = {
                name: '',
                path: '',
                paths: [],
                regexes: [],
                subroutes: [],
                controller: undefined,
                defaults: {},
                requirements: {},
                placeholders: {}
            };

            this.route = this.emptyRoute;
        }

        resetRoute() {
            this.route = {};
            
            this.emptyRoute = {
                name: '',
                path: '',
                paths: [],
                regexes: [],
                subroutes: [],
                controller: undefined,
                defaults: {},
                requirements: {},
                placeholders: {}
            };
        }

        setRoute(route) {
            this.resetRoute();
            this.route = Object.assign({}, Object.assign({}, this.emptyRoute), route);

            this.configure();
            this.extractPlaceholders();
            this.buildPaths();
            this.buildRegexes();
        }

        configure() {
            this.route.path = Organizator.Routing._clearQueryString(Organizator.Routing._clearSlashes(this.route.path));
        }

        compile(route) {
            this.setRoute(route);

            var CompiledRoute = new Organizator_Routing_Route({
                name: this.route.name,
                path: this.route.path,
                paths: this.route.paths,
                isRegex: this.route.isRegex,
                regex: this.route.regex,
                regexes: this.route.regexes,
                subroutes: this.route.subroutes,
                placeholders: this.route.placeholders,
                controller: this.route.controller,
                defaults: this.route.defaults,
                requirements: this.route.requirements
            });

            return CompiledRoute;
        }

        extractPlaceholders() {
            var pattern = this.parameterPattern;
            var path = this.route.path;

            var placeholders = [], match;
            // very important to reset lastIndex since RegExp can have "g" flag
            // and multiple runs might affect the result, specially if matching
            // same string multiple times on IE 7-8
            pattern.lastIndex = 0;

            while (match = pattern.exec(path)) {
                placeholders.push(match[0]);
            }

            if (!placeholders) {
                this.route.isRegex = false;
            } else {
                this.route.isRegex = true;
                this.route.placeholders = placeholders;
            }
        }

        isRegex(path) {
            var pattern = this.parameterPattern;
            return new RegExp(pattern).test(path);
        }

        buildRegexes() {
            var subroutesLength = this.route.subroutes.length;

            if (!subroutesLength || !this.route.isRegex) {
                return;
            }

            for (var i = 0; i < subroutesLength; i++) {
                var regexedPath = this.buildRegexFromPath(this.route.subroutes[i].path);

                if (this.isRegex(this.route.subroutes[i].path)) {
                    this.route.subroutes[i].isRegex = true;
                    this.route.subroutes[i].regex = regexedPath;
                } else {
                    this.route.subroutes[i].isRegex = false;
                }

                if (i == 0) {
                    this.route.regex = regexedPath;
                }

                this.route.regexes.push(regexedPath);
            }
        }

        buildRegexFromPath(regexedPath) {
            for (var t = 0; t < this.route.placeholders.length; t++) {

                if (this.route.requirements[Organizator.Routing._clearBrackets(this.route.placeholders[t])] !== undefined) {
                    if (this.route.requirements[Organizator.Routing._clearBrackets(this.route.placeholders[t])] instanceof RegExp) {
                        var placeholderPattern = Organizator.Routing._clearRegexDelimiters(this.route.requirements[Organizator.Routing._clearBrackets(this.route.placeholders[t])].toString());
                    } else {
                        var placeholderPattern = this.route.requirements[Organizator.Routing._clearBrackets(this.route.placeholders[t])];
                    }
                } else {
                    var placeholderPattern = '.[^/]*';
                }

                regexedPath = regexedPath.replace(this.route.placeholders[t], '(' + placeholderPattern + ')');
            }

            return new RegExp('^' + regexedPath + '$');
        }

        buildPaths() {
            this.route.paths.push(this.route.path);
            this.route.subroutes.push({
                path: this.route.path,
                regex: this.buildRegexFromPath(this.route.path)
            });
            this.buildPathsWithDefaultValues();
        }

        /*
         * Build alternative paths if default values exist
         */
        buildPathsWithDefaultValues() {
            var defaults = this.route.defaults;
            var keysDefaults = Object.keys(defaults);
            var newPath = this.route.path;
            var defaultsBag = [];

            for (var i = 0; i < keysDefaults.length; i++) {
                var t = keysDefaults.length - (i + 1);
                var placeholder = '{' + keysDefaults[t] + '}';
                var placeholderValue = defaults[keysDefaults[t]];

                if (newPath.lastIndexOf(placeholder) + placeholder.length == newPath.length) {
                    var newPath = Organizator.Routing._clearSlashes(newPath.replace(placeholder, ''));

                    if (this.route.paths.indexOf(newPath) == -1) {
                        var subroute = {
                            path: newPath,
                            defaults: []
                        };

                        defaultsBag.push({
                            placeholder: keysDefaults[t],
                            value: placeholderValue
                        });

                        subroute.defaults = defaultsBag;

                        this.route.paths.push(newPath);
                        this.route.subroutes.push(subroute);
                    }
                }
            }
        }

//    buildPathsWithDefaultValuesRecursively(path, defaults){
//        var keysDefaults = Object.keys(defaults);
//        
//        for(var i = 0; i  < keysDefaults.length; i++){
//            var newPath = path.replace('{' + keysDefaults[i] + '}', defaults[keysDefaults[i]]);
//            
//            if(this.route.paths.indexOf(newPath) == -1){
//                this.route.paths.push(newPath);
//                this.route.subroutes
//            }                
//            
//            var restOf = Object.assign({}, defaults);
//            delete restOf[keysDefaults[i]];
//            
//            if(!Object.keys(restOf).length){continue;}
//            
//            this.buildPathsWithDefaultValuesRecursively(newPath, restOf);
//        }
//    }
    }
    
    return Organizator_Routing_RouteCompiler;
});
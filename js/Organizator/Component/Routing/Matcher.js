/*
 * Matcher is a part of Routing component.
 * It matches a path with a CompiledRoute.
 * 
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(
    function () {
        class Organizator_Routing_Matcher {
            constructor() {
                this.state = 'loaded';
                this.window = window;

                this.bindEvents();
            }

            bindEvents() {
                // this.Interface.window.addEventListener('organizator:routing:request:load', (event) => this.request(event));
            }

            /*
             * @param {String} request.resource - Defines the source of the content would be loaded.
             * @return {Route} route.
             */
            request(event) {
                var path = event.detail.resource;
                var route = this.checkAll(path);

                if (route !== false) {
                    var customEvent = new CustomEvent('router:matched', {'detail': route});
                    this.window.dispatchEvent(customEvent);
                }

                return route;
            }

            check(path, route) {
//    	if(!route.isRegex){
//            return path == route.path ? true : false;
//    	}else{
;
                return new RegExp(route.regex).test(path);
//    	}

//    	return false;
            }

            checkAll(path) {
                var path = Organizator.Routing._getFragment(path);
                var routesKeys = Object.keys(Organizator.Routing.routes);
                
                for (var i = 0; i < routesKeys.length; i++) {
                    for (var t = 0; t < Organizator.Routing.routes[routesKeys[i]].subroutes.length; t++) {
                        if (!Organizator.Routing.routes[routesKeys[i]].subroutes[t].isRegex) {
                            if (path == Organizator.Routing.routes[routesKeys[i]].subroutes[t].path) {
                                var matchedRoute = {
                                    route: Organizator.Routing.routes[routesKeys[i]],
                                    subroute: Organizator.Routing.routes[routesKeys[i]].subroutes[t]
                                };

                                return matchedRoute;
                            }
                        } else {
                            if (this.check(path, Organizator.Routing.routes[routesKeys[i]].subroutes[t])) {
                                var matches = this.getParameters(path, Organizator.Routing.routes[routesKeys[i]].subroutes[t].regex);
                                var matchedRoute = {
                                    route: Organizator.Routing.routes[routesKeys[i]],
                                    subroute: Organizator.Routing.routes[routesKeys[i]].subroutes[t],
                                    matches: matches
                                };

                                return matchedRoute;
                            }
                        }
                    }
                }

                return false;
            }

            getName(path) {
                var matchedRoute = this.checkAll(path);

                return matchedRoute.route.name || false;
            }

            getParameters(path, regex) {
                var matches = path.match(regex);

                if (matches) {
                    matches.shift();
                }

                return matches;
            }

            extractParameters(path, pattern) {
                var parameters = [], match;
                var pattern = pattern || /(?:\{)([^}:]+)(?:\})/g
                // very important to reset lastIndex since RegExp can have "g" flag
                // and multiple runs might affect the result, specially if matching
                // same string multiple times on IE 7-8
                pattern.lastIndex = 0;

                while (match = pattern.exec(path)) {
                    parameters.push(match[0]);
                }

                return parameters;
            }
        }

        return Organizator_Routing_Matcher;
    }
);

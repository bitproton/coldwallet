define(
    [
        'js/Organizator/Component/Routing/Locator',
        'js/Organizator/Component/Routing/Matcher',
        'js/Organizator/Component/Routing/Generator',
        'js/Organizator/Component/Routing/RouteCompiler',
        'js/node_modules/urijs/src/URI'
    ],
    function (
        Organizator_Routing_Locator,
        Organizator_Routing_Matcher,
        Organizator_Routing_Generator,
        Organizator_Routing_RouteCompiler,
        URI
    ) {
        class Organizator_Routing {
            constructor(options) {
                this.base =  this._addSlash(options.base) || '/',
                this.mode =  options.mode || 'history' // history || hash || hashbang;

                this.currentUrl = new URI();

                this.requestOptions = options.requestOptions !== undefined ? Object.assign({
                    mode: 'push',
                    popstatable: true,
                    absolute: false,
                    load: true,
                    controller: true
                }, options.requestOptions) : {
                    mode: 'push',
                    popstatable: true,
                    absolute: false,
                    load: true,
                    controller: true
                }

                this.state = 'loaded';
                this.window = window

                this.Locator = new Organizator_Routing_Locator();
                this.Matcher = new Organizator_Routing_Matcher();
                this.Generator = new Organizator_Routing_Generator();
                this.RouteCompiler = new Organizator_Routing_RouteCompiler();

                this.routes = [];
                this.controllers = {};

                this.bindEvents();
            }

            bindEvents() {
                this.window.addEventListener('popstate', (event) => this.popstate(event));
                //this.Interface.window.addEventListener('organizator:routing:route:created', (event) => this.addRoute(event));
                //this.Interface.window.addEventListener('organizator:routing:request', (event) => this.listenRequests(event));
            }

            /*
             * Listens routing:request events and pass request details to request().
             */
            listenRequests() {
                this.request(event.detail.request);
            }

            /*
             * Accepts a (hashchange, pushState, replaceState, popstate) request.
             * 
             * @param {Object} request
             * @param {String} request.mode - Defines the mode of the request. Default is 'push'.
             * @param {String} request.popstatable - Defines whether the state is popstatable or not. Default is true.
             * @param {String} request.url - Defines the new url of the window.
             * @param {String} request.absolute - Defines whether the url is absolute or not. Default is false.
             */
            request(request) {
                /*
                 * Write the request over the defaults. Default values are used if an option is missing.
                 */
                request = Object.assign(Object.assign({}, this.requestOptions), request);
                request.url = this._resolveFragment(request.url);
                
                var matchedRoute = this.Matcher.checkAll(request.url);
                
                if (matchedRoute !== false) {
                    var parameters = matchedRoute.matches || [];

                    if (matchedRoute.subroute.defaults) {
                        for (var i = 0; i < matchedRoute.subroute.defaults.length; i++) {
                            parameters.push(matchedRoute.subroute.defaults[i].value);
                        }
                    }

                    parameters.push(request);

                    var locatorResponse = Organizator.Routing.Locator.request(request);

                    
                    if (typeof matchedRoute.route.controller !== 'undefined' && matchedRoute.route.controller !== '' && locatorResponse) {
                        switch (typeof matchedRoute.route.controller) {
                            case 'function':
                                matchedRoute.route.controller.apply({}, parameters);
                                break;
                            case 'string':
                                this.controllers[matchedRoute.route.controller].apply({}, parameters);
                                break;
                        }
                    }else{
                        return false;
                    }

                    return true;
                }

                return false;
            }

            addRoute(name, compiledRoute) {
                this.routes[name] = compiledRoute;
            }
            
            addController(name, handler) {
                this.controllers[name] = handler;
            }

            /*
             * Window object execute this function when a popstate event fired.
             * 
             * It looks 'popstatable' flag in the state. If its value is true then send a request to request() function with 'mode':'load-only'
             * because window.location is already changed by the browser itself and there is no need to push a state again. We need only
             * load the source.
             * 
             * Window will be reloaded if it's not popstatable.
             */
            popstate(event) {
                /*
                 * Request is passed here from a History API state.
                 */
                var request = event.state;

                /*
                 * Page should be reloaded if request is not popstatable.
                 */
                if (!(request === undefined || request == null)) {
                    if (request.popstatable) {
                        request.mode = 'popstate';
                        this.request(request);
                    } else {
                        this.window.location.reload();
                        return;
                    }
                }

                return;
            }

            _getFragment(path) {
                var fragment = path.replace(/\?(.*)$/, '');

                return this._clearSlashes(fragment);
            }

            _resolveFragment(path) {
                return path.indexOf(this.base) == 0 ? path.replace(this.base, '') : path;
            }

            _clearSlashes(path) {
                return path.toString().replace(/\/$/, '').replace(/^\//, '');
            }

            _addSlash(path){
                return this._clearSlashes(path) + '/';
            }

            _clearQueryString(path) {
                return path.split('?')[0];
            }

            _clearBrackets(string) {
                return string.replace('{', '').replace('}', '');
            }

            _clearRegexDelimiters(string) {
                return string.toString().replace(/\/$/, '').replace(/^\//, '');
            }

            _addRegexDelimiters(string) {
                return '/' + string + '/';
            }
        }
        
        return Organizator_Routing;
    }
);
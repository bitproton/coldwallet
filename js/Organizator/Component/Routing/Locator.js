/*
 * Locator is a part of Routing component.
 * It responses History API-related requests into actions.
 * 
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(function () {
    class Organizator_Routing_Locator {
        constructor ( options = {} ) {
            this.requestOptions = options.requestOptions !== undefined ? Object.assign({
                mode: 'push',
                popstatable: true,
                absolute: false,
                load: true
            }, options.requestOptions) : {
                mode: 'push',
                popstatable: true,
                absolute: false,
                load: true
            }

            this.state = 'loaded';
            this.window = window;

            this.bindEvents();
        }

        bindEvents() {
//        this.Interface.window.addEventListener('popstate', () => this.popstate());
            // this.Interface.window.addEventListener('organizator:routing:request', (event) => this.listenRequests(event));
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
         * @param {String} request.data - Extra data.
         * @param {Boolean} request.load - Defines whether resource to be loaded or not. Default is true.
         * @param {Function} request.callback - Function name or function itself.
         */
        request(request) {
            /*
             * Write the request over the default one. Default value is used if an option is missing.
             */
            request = Object.assign(this.requestOptions, request);

            /*
             * We prepend the defined base value to url if passed url is not involve it already.
             */
            var url = (request.url && request.absolute) ? request.url : Organizator.Routing.base + request.url;

            if (url == window.location) {
                request.mode = 'replace';
            }

            switch (request.mode) {
                case 'push':
                    history.pushState(request, null, url);
                    break;

                case 'replace':
                    history.replaceState(request, null, url);
                    break;

                case 'reload':
                    this.window.location.reload();
                    break;

                case 'popstate':
                    break;
            }

            return true;
        }
    }

    return Organizator_Routing_Locator;
});
/*
 * Matcher is a part of Routing component.
 * It matches a path with a CompiledRoute.
 * 
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(function () {
    class Organizator_Routing_Generator {
        constructor() {}

        generateUrl(routeName, parameters = {}, options = {checkRequirements: false, absolute: true}){
            var route = Organizator.Routing.routes[routeName];
            var queryStringParameters = {};

            if (!route) {
                return false;
            }

            if (route.placeholders.length) {
                parameters = Object.assign({}, Object.assign({}, route.defaults), parameters);
                var filledPath = route.path;

                for (var parameter in parameters) {
                    if (options.checkRequirements
                        && route.requirements[parameter] !== undefined
                        && !route.requirements[parameter].test(parameters[parameterKeys[i]])
                    ){
                        return false;
                    }

                    if(route.placeholders.indexOf('{' + parameter + '}') !== -1){
                        filledPath = filledPath.replace('{' + parameter + '}', parameters[parameter]);
                    }else{
                        queryStringParameters[parameter] = parameters[parameter];
                    }
                }

                return Organizator.Routing._clearSlashes(!options.absolute ? filledPath : Organizator.Routing.base + filledPath) + (Object.keys(queryStringParameters).length ? '?' + this._buildQueryString(queryStringParameters) : '');
            } else {
                if(Object.keys(parameters).length){
                    queryStringParameters = JSON.parse(JSON.stringify(parameters));
                }

                return Organizator.Routing._clearSlashes(!options.absolute ? route.path : Organizator.Routing.base + route.path) + (Object.keys(queryStringParameters).length ? '?' + this._buildQueryString(queryStringParameters) : '');
            }
        }

        _buildQueryString(obj, urlEncode) {
            //
            // Helper function that flattens an object, retaining key structer as a path array:
            //
            // Input: { prop1: 'x', prop2: { y: 1, z: 2 } }
            // Example output: [
            //     { path: [ 'prop1' ],      val: 'x' },
            //     { path: [ 'prop2', 'y' ], val: '1' },
            //     { path: [ 'prop2', 'z' ], val: '2' }
            // ]
            //
            function flattenObj(x, path) {
                var result = [];

                path = path || [];
                Object.keys(x).forEach(function (key) {
                    if (!x.hasOwnProperty(key)) return;

                    var newPath = path.slice();
                    newPath.push(key);

                    var vals = [];
                    if (typeof x[key] == 'object') {
                        vals = flattenObj(x[key], newPath);
                    } else {
                        vals.push({ path: newPath, val: x[key] });
                    }
                    vals.forEach(function (obj) {
                        return result.push(obj);
                    });
                });

                return result;
            } // flattenObj

            // start with  flattening `obj`
            var parts = flattenObj(obj); // [ { path: [ ...parts ], val: ... }, ... ]

            // convert to array notation:
            parts = parts.map(function (varInfo) {
                if (varInfo.path.length == 1) varInfo.path = varInfo.path[0];else {
                    var first = varInfo.path[0];
                    var rest = varInfo.path.slice(1);
                    varInfo.path = first + '[' + rest.join('][') + ']';
                }
                return varInfo;
            }); // parts.map

            // join the parts to a query-string url-component
            var queryString = parts.map(function (varInfo) {
                return varInfo.path + '=' + varInfo.val;
            }).join('&');
            if (urlEncode) return encodeURIComponent(queryString);else return queryString;
        }
    }

    return Organizator_Routing_Generator;
});
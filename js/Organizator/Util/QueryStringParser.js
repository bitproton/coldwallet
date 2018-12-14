
class Organizator_Util_QueryStringParser{
    constructor(){}
    /*
     * @author <sindresorhus>
     * https://github.com/sindresorhus/query-string/
     * 
     * @devnote check also this https://github.com/christianalfoni/form-data-to-object/blob/master/index.js
     */
    _parseQueryString(str, opts) {
        opts = Object.assign({arrayFormat: 'none'}, opts);

        var formatter = this._parserForArrayFormat(opts);

        // Create an object with no prototype
        // https://github.com/sindresorhus/query-string/issues/47
        var ret = Object.create(null);

        if (typeof str !== 'string') {
            return ret;
        }

        str = str.trim().replace(/^(\?|#|&)/, '');

        if (!str) {
            return ret;
        }

        str.split('&').forEach(function (param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            var key = parts.shift();
            var val = parts.length > 0 ? parts.join('=') : undefined;

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            formatter(decodeURIComponent(key), val, ret);
        });

        return Object.keys(ret).sort().reduce(function (result, key) {
            var val = ret[key];
            if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
                // Sort object keys, not values
                result[key] = keysSorter(val);
            } else {
                result[key] = val;
            }

            return result;
        }, Object.create(null));
    }

    /*
     * @author <sindresorhus>
     * https://github.com/sindresorhus/query-string/
     */
    _parserForArrayFormat(opts) {
        var result;

        switch (opts.arrayFormat) {
            case 'index':
                return function (key, value, accumulator) {
                    result = /\[(\d*)\]$/.exec(key);

                    key = key.replace(/\[\d*\]$/, '');

                    if (!result) {
                        accumulator[key] = value;
                        return;
                    }

                    if (accumulator[key] === undefined) {
                        accumulator[key] = {};
                    }

                    accumulator[key][result[1]] = value;
                };

            case 'bracket':
                return function (key, value, accumulator) {
                    result = /(\[\])$/.exec(key);

                    key = key.replace(/\[\]$/, '');

                    if (!result || accumulator[key] === undefined) {
                        accumulator[key] = value;
                        return;
                    }

                    accumulator[key] = [].concat(accumulator[key], value);
                };

            default:
                return function (key, value, accumulator) {
                    if (accumulator[key] === undefined) {
                        accumulator[key] = value;
                        return;
                    }

                    accumulator[key] = [].concat(accumulator[key], value);
                };
        }
    }
}
/*
 * Route is a part of Routing component.
 * Routes are compiled by RouteCompiler and registered to the application.
 * 
 * @author Emre Alper �zdemir <ozdemyr@gmail.com>
 */
define(function () {
    class Organizator_Routing_Route {
        constructor(options) {
            this.name = options.name;
            this.path = options.path;
            this.paths = options.paths;
            this.isRegex = options.isRegex;
            this.regex = options.regex;
            this.regexes = options.regexes;
            this.subroutes = options.subroutes;
            this.alternativeRegexes = options.alternativeRegexes;
            this.placeholders = options.placeholders;
            this.controller = options.controller;
            this.defaults = options.defaults;
            this.requirements = options.requirements;
        }
    }

    return Organizator_Routing_Route;
});
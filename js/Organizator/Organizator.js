define(
    [
        'js/Organizator/config',
        'js/Organizator/Component/Globals/Globals',
        'js/Organizator/Component/Routing/Routing',
        'js/Organizator/Component/Validation/Validator',
        'js/Organizator/Component/Nunjucks/Nunjucks',
        'js/Organizator/Component/Translator/Translator',
        'js/node_modules/lokijs/build/lokijs.min',
        'js/Organizator/Util/FormSerializer',
        'js/Organizator/Polyfill/parents',
        'js/Organizator/Polyfill/date.format'
    ],
    function(
        config,
        Organizator_Globals,
        Organizator_Routing,
        Organizator_Validation_Validator,
        Organizator_Nunjucks,
        Organizator_Translator,
        Loki,
        Organizator_Util_FormSerializer
    ){
        class Organizator {
            constructor(configuration = {}){
                var self = this;

                this.configuration = Object.assign(config, configuration);
                this.configuration.localization.locale = document.querySelector('html').getAttribute('org-locale');
                
                this.Globals = new Organizator_Globals();

                this.Routing = new Organizator_Routing({
                    base: ['localhost', '127.0.0.1', '::1'].indexOf(window.location.host) !== -1 ? (typeof this.configuration.devBasePath !== 'undefined' ? this.configuration.devBasePath : (typeof this.configuration.basePath ? this.configuration.basePath : '/')) : (typeof this.configuration.basePath ? this.configuration.basePath : '/'),
                    mode: 'history'
                });
                
                this.Validator = new Organizator_Validation_Validator();
                
                this.Db = new Loki('organizator_database.db');

                this.PersistentDb = new Loki("organizator_peristent_database.db", { 
                  autoload: true,
                  // autoloadCallback : databaseInitialize,
                  autosave: false
                });

                this._Nunjucks = Organizator_Nunjucks;
                this.Nunjucks = new this._Nunjucks.Environment(new this._Nunjucks.WebLoader(''));

                this.Nunjucks.addGlobal('path', function(route, parameters, options) {
                    return self.Routing.Generator.generateUrl(route, parameters, options);
                });

                require(['js/Organizator/Util/NumberFormat'], function(number_format){
                    self.Nunjucks.addFilter('number_format', function(number, decimals, decPoint, thousandsSep) {
                        return number_format(number, decimals, decPoint, thousandsSep);
                    });
                });

                require(['js/Organizator/Util/ArrayIntersect'], function(array_intersect){
                    self.Nunjucks.addFilter('array_intersect', function() {
                        return array_intersect(arguments);
                    });
                });

                self.Nunjucks.addFilter('date', function(date, format) {
                    return new Date(date * 1000).format(format);
                });

                this.FormSerializer = new Organizator_Util_FormSerializer();
                this.Translator = new Organizator_Translator({
                    defaultLocale: this.configuration.localization.defaultLocale,
                    availableLocales: this.configuration.localization.availableLocales,
                    locale: this.configuration.localization.locale
                });
                
                this.applications = {};
                this.globals = {};
            }
            
            getXMLObject(object, id){
                if(window.document === undefined){return false;}
                
                if(id !== undefined){
                    var elements = window.document.querySelectorAll('[org-object="' + object + '"][org-id="' + id + '"]');
                }else{
                    var elements = window.document.querySelectorAll('[org-object="' + object + '"]');
                }
                
                if(elements.length === 1){
                    elements = elements[0];
                }

                return elements;
            }
        }
        
        if(window.Organizator === undefined){
            window.Organizator = new Organizator();
        }

        return window.Organizator;
    }
);
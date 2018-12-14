define(
    function(){
    class Organizator_Application{
        constructor(name = undefined){
//            options = Object.assign({
//                routes: {},
//                controllers: {}
//            }, options);
            
            this.name = name;
//            this.routes = options.routes;
//            this.controllers = options.controllers;
//            this.entities = options.entities;
            
              this.registerApplication();
//            this.registerRoutes();
//            this.registerControllers();
//            this.registerTranslations(options.translations || []);

        }
        
        registerApplication(){
            Organizator.applications[this.name] = this;
        }
        
//        registerRoutes(){
//            let routesKeys = Object.keys(this.routes);
//            if(!routesKeys.length){return;}
//            
//            let routeCompiler = new RouteCompiler();
//            
//            for(let i = 0; i < routesKeys.length; i++){
//                let route = this.routes[routesKeys[i]];
//                Organizator.Routing.addRoute(routesKeys[i], routeCompiler.compile(route));
//            }
//        }
//        
//        registerControllers(){
//            let controllerKeys = Object.keys(this.controllers);
//            if(!controllerKeys.length){return;}
//            
//            for(let i = 0; i < controllerKeys.length; i++){
//                Organizator.Routing.addController(controllerKeys[i], this.controllers[controllerKeys[i]]);
//            }
//        }
//        
//        registerEntities(){
//            let entities = this.entities;
//            if(!controllerKeys.length){return;}
//            
//            for(let i = 0; i < controllerKeys.length; i++){
//                Organizator.Routing.addController(controllerKeys[i], this.controllers[controllerKeys[i]]);
//            }
//        }
//        
//        registerTranslations(translations){
//            if(!translations.length){return;}
//            
//            let parser = new DOMParser();
//            
//            for(let i = 0; i < translations.length; i++){
//                let translation = translations[i];
//                let document = parser.parseFromString(translation, 'application/xml');
//                
//                Organizator.Translator.addDocument(document, 'xliff');
//            }
//        }
    }
    
    return Organizator_Application;
});
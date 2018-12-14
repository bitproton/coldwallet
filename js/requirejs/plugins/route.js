define(function(){
    return {
        load: function(name, parentRequire, onload, config) {
            parentRequire(
                [
                    name
                ], function(
                    value
                ){
                    if(config.isBuild){
                        onload(null); //avoid errors on the optimizer
                    }else{
                        let routes = value;
                        let routesKeys = Object.keys(routes);

                        if(routesKeys.length){
                            let routeCompiler = Organizator.Routing.RouteCompiler;

                            for(let i = 0; i < routesKeys.length; i++){
                                let route = routes[routesKeys[i]];
                                Organizator.Routing.addRoute(routesKeys[i], routeCompiler.compile(route));
                            }
                        }

                        onload(value);
                    }
                }
            );
        }
    };
});
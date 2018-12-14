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
                        let controllers = value;
                        let controllerKeys = Object.keys(controllers);
                        if(controllerKeys.length){
                            for(let i = 0; i < controllerKeys.length; i++){
                                Organizator.Routing.addController(controllerKeys[i], controllers[controllerKeys[i]]);
                            }
                        }
                        
                        onload(value);
                    }
                }
            );
        }
    };
});
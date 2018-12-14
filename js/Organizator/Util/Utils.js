class Utils {
    constructor(){}
    
    getType(value){
        switch(typeof value){
            case 'object':
                
                if(value.constructor.name == 'Array'){
                    return 'array';
                }
                
                if(value.constructor.name == 'Function'){
                    return 'function';
                }
                
                return 'object';
                
                break;
            case 'function':
                break;
            case 'number':
                return 'number';
                break;
            case 'string':
                return 'string';
                break;
            case undefined:
                return undefined;
                break;
        }
    }
}
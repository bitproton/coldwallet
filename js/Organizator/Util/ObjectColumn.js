define(function(){
	return function object_column(object, property) {
		console.log(object);
	    let newArray = [];

	    for(let key of object){
	    	newArray.push(object[key][property]);
	    }
	}
});
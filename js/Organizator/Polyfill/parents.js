(function(){
	if(typeof Element !== 'undefined' && !('parents' in Element.prototype)){
		Element.prototype.parents = function(selector){
			let current = this,
				parents = [],
				test = (undefined || null) === selector ? false : true;

			while(current.parentNode !== null && current.parentNode !== document.documentElement){
				if(test && !(current.parentNode.matches(selector))){
     				current = current.parentNode;
					continue;
				}

				parents.push(current.parentNode);
     			current = current.parentNode;
			}

			return parents;
		}
	}

	return;
})();
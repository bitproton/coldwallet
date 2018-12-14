program -> expr {%
	function(d){
		return {
			type: 'program',
			body: d
		}
	}
%}

expr -> "(" _ expr _ ")" {%
	function(d){
		return d[2];
	}
%}

expr -> expr _ op _ expr {%
	function(d){
		let f = d.filter(function(i){return i !== null}); 
		
		return {
			type: 'operation',
			value: f
		}
	}
%}

expr -> rule {% id %}

rule -> "@" [a-z]:+ _ "(" _ args _ ")" {%
	function(d){
		let o = {};
		
		for(var i = 0; i < d[5].length; i++){
			o = Object.assign(o, d[5][i]);
		}
		
		return {
			type: 'rule',
			name: d[1].join(''),
			arguments: o
		}
	}
%}

rule -> "@" [a-z]:+ _ "(" _ ")" {%
	function(d){
		return {
			type: 'rule',
			name: d[1].join(''),
			arguments: null
		}
	}
%}

rule -> "@" [a-z]:+ {%
	function(d){
		return {
			type: 'rule',
			name: d[1].join(''),
			arguments: null
		}
	}
%}

args -> args _ "," _ arg {%  
	function(d){
		let args = [];
		
		for(var i = 0; i < d[0].length; i++){
			args = args.concat(d[0][i]);
		}
		
		args = args.concat(d[4]);
		return args;
	}
%}

args -> arg {%  
	function(d){
		return [d[0]];
	}
%}

arg -> argkey _ "=" _ argval {%  
	function(d){
		let o = {};
		o[d[0]] = d[4];
		
		return o;
	}
%}

argkey -> word {% id %}
argval -> word {% id %}

word -> [^\s=(),'"]:+ {%  
	function(d){
		return d[0].join('');	
	}
%}

word -> "\"" [^"]:+ "\"" {%  
	function(d){
		return d[1].join('');	
	}
%}

word -> "'" [^']:+ "'" {%  
	function(d){
		return d[1].join('');	
	}
%}

op -> "&&" {%
	function(d){
		return {
			type: 'operator',
			value: d[0]
		}
	}
%}

op -> "||" {%
	function(d){
		return {
			type: 'operator',
			value: d[0]
		}
	}
%}

_  -> wschar:* {% function(d) {return null;} %}
__ -> wschar:+ {% function(d) {return null;} %}

wschar -> [ \t\n\v\f] {% id %}
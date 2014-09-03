//test Function prototype

var s = new Function("'use strict';debugger;return 'xxx'");

s.prototype = {
	sayHello: function(){alert(1)}
};

function a() {
	s();
};

a.prototype = s.prototype;

function a() {
	return new String('2131');
};

b = function() {
	return new a() + ''
};

a.prototype.toString = function() {
	return new a();
};

//test `with` context

function withFunc(data) {
	data = {name: 'alex', age: 12, over: 'xxxx'}
	var str = 'hello';
	var wo_ow;
	var over = 'mmmmm';
	with (data) {
		console.log(str); //hello
		console.log(name); //alex
		console.log(age); //12
		console.log(over); //xxxx
		console.log(wo_ow); //undefined
		console.log(no_wo_ow); //error
	}
	return null;
}



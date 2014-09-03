// node --debug-brk test.js

var template = require('../../template');
var fs = require('fs');

template.config({
	src: './',
	env: 'production'
});


var rs = template.renderFile('index.html', {
	name: ' fsdf - weqeqw <h2>11</h2>',
	o: {
		name: 'long namemmmmmmmmm',
		kk: 'waccc',
		jige: '23123'
	}
});
console.log(rs);
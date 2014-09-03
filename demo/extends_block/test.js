var template = require('../../template');
var fs = require('fs');

template.config({
	cacheDir: '../../__cache__',
	src: '../../demo'
});

template.helper('hello', function(str) {
	return 'hello, ' + str;
});

var rs = template.renderFile('extends_block/child.html', {
	name: ' fsdf - weqeqw <h2>11</h2>',
	o: {
		name: 'long namemmmmmmmmm',
		kk: 'waccc',
		jige: '23123'
	}
});
console.log(rs);
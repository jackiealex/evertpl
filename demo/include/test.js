var template = require('../../template');
var fs = require('fs');

template.config({
	cacheDir: '../../__cache__',
	src: '../../demo'
});

template.helper('hello', function(str) {
	return 'hello, ' + str;
});

var rs = template.renderFile('include/include.html', {});
console.log(rs);
// node --debug-brk test.js

var template = require('./template');
var fs = require('fs');

var str = fs.readFileSync('./test/include.html', 'utf8');

// var rs = template.render(str, {name: ' fsdf - weqeqw <h2>11</h2>'});
// console.log(rs);

template.config({
	src: './test'
});


var rs = template.renderFile('include.html', {name: ' fsdf - weqeqw <h2>11</h2>', o : {name: 'long namemmmmmmmmm', kk: 'waccc', jige: '23123'}});
console.log(rs);
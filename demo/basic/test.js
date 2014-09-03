var template = require('../../template');
var fs = require('fs');

var data= {}

var rs = template.renderFile('basic.html', data);

console.log(rs)
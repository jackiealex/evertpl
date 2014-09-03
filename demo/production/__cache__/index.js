module.exports = function anonymous($_data_) {
var $_output_ = '';var __$utils = this,$helper = this,__$include = __$utils.include;
var name;
with($_data_ || {}) {
var $_output_ = '';$_output_ += '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\nhwo fuck you \t<title>test</title>\n</head>\n<body>\n\t';
 if (name) {
$_output_ += '\n\t\t<div class="hello">';
$_output_ += name;
$_output_ += '</div>\n\t';
 } 
$_output_ += '\n\t';
$_output_ += __$include('__cache__/sub.html', undefined);
$_output_ += '\n</body>\fdafsdadsfn</html>';
}
return new String($_output_);

}
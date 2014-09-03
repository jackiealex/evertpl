module.exports = function anonymous($_data_) {
var $_output_ = '';var __$utils = this,$helper = this,__$include = __$utils.include,__$trim = __$utils.trim,__$escape = __$utils.escape,__$ensure = __$utils.ensure,__$count = __$utils.count;
var name,a,wo_wo,de;
with($_data_ || {}) {
var $_output_ = '';$_output_ += '';

	var a = 12;
	var de = null;
	var list = [1,2,3];

$_output_ += '\n';
 if(a) { 
$_output_ += '\n\t<div>';
name = __$trim(name);
$_output_ += name;
$_output_ += ' </div>\n\t<div>';
name = __$trim(name);
name = __$escape(name);
$_output_ += name;
$_output_ += ' </div>\n\t<div>inline variable: ';
$_output_ += a;
$_output_ += ' </div>\n\t<div>unknow variable: ';
$_output_ += wo_wo;
$_output_ += ' </div>\n\t<div>unknow variable: ';
wo_wo = __$ensure(wo_wo);
$_output_ += wo_wo;
$_output_ += ' </div>\n\t<div>unknow variable: ';
de = __$ensure(de);
de = __$ensure(de);
de = __$count(de);
$_output_ += de;
$_output_ += ' </div>\n';
 } 
$_output_ += '\n';
if (1) {
$_output_ += '\n\t<div>1</div>\n';
}
$_output_ += '\n';
for(var i=0; i <list.length; i++) {
$_output_ += '\n\t<div>';
$_output_ += list[i];
$_output_ += '</div>\n';
}
$_output_ += '\n\n';
}
return new String($_output_);

}
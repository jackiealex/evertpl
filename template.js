var fs = require('fs')
	, path = require('path')
	, mkdirp = require('mkdirp');
/**
 * config
 * @type {Object}
 */


var GLOBAL_ERROR_TYPE = 'string';// compile your file to this directory

var ERROR_CODE = {
	UNWANTED_EXTENDS: 401,
	NOT_SUPPORT: 502,
	CHILD_TMPL_NEEDED: 100,
	UNIQUE_COMMAND_LIMITED: 200
};

var _config = {
	openTag: '<%',
	closeTag: '%>',
	src: './',
	keepComments: true,
	extName: '.html',
	errorType: 'string',
	cacheDir: './__cache__/',
	env: 'development',
	debug: false, //关闭调试对某些输出进行关闭
	locals: {
		version: '1.0.0'
	}
};


var _entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;'
};


// When escape sequence occurr in javascript variable, it CAN'T
// be seen with your naked eye; when it enter the function body, it
// makes your all expression break inline and error come into being, so...
var _escapes = {
	"'": "'",
	'\\': '\\',
	'\r': 'r',
	'\n': 'n',
	'\t': 't',
	'\u2028': 'u2028',
	'\u2029': 'u2029'
};

var _escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

var _noMatch = /(.)^/;

var _basicMather = {
	_evaluate: /<%([\s\S]+?)%>/g,
	_interpolate: /\${([\s\S]+?)}/g,
	_comment: /<\!--([\s\S]+?)-->/g
};

var _commandMatcher = {
	_cmdSet: /<%(extends|include|block|literal)([\s\S]*?)\/?%>/g,
	_include: /<%include\s+(?:name=)?('|")([\s\S]+?)\1(\s+(?:var=)?\1([\s\S]+?)\1)?\s*\/?%>/,
	_block: /<%block\s+(?:name=)?('|")([\s\S]+?)\1([\s\S]*?)%>([\s\S.]*?)<%\/block%>/,
	_literal: /<%literal%>([\s\S.]*?)<%\/literal%>/,
	_extends: /<%extends\s+(?:name=)?('|")([\s\S]+?)\1\s*\/?%>/
};


//all string will appear in compiled function
var RENDER_STRING_DECLATION = "var $_output_ = '';"
	, RENDER_WITH_CONTEXT_START = "with($_data_ || {}) {\n"
	, RENDER_WITH_CONTEXT_END = "}\n"
	, RENDER_ADDITION_START = "$_output_ += '"
	, RENDER_ADDITION_END = "'"
	, RENDER_ADDITION_VAR = "$_output_ += "
	, RENDER_RETURN = "return new String($_output_);\n"
	, RENDER_LINE_BREAK = ";\n"
	, RENDER_VAR_PREFIX = "__$"
	, RENDER_UTILS_OBJECT = RENDER_VAR_PREFIX + "utils"
	, REFER_HELPER_NAME = "$helper"
	, RENDER_LOCAL_NAME = "__LOCAL__"
	, RENDER_INCLUDE_METHOD = RENDER_VAR_PREFIX + "include";

// INNER FUNCTION START
/**
 * no HTML output
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function escape(str) {
	return str.replace(/[&<>"']/g, function(c) {
		return _entityMap[c];
	});
};

/**
 * remove spaces
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function trim(str) {
	return String(str).replace(/^\s+|\s+$/g,'');
};

function count(o) {
	if (o.length) {
		return o.length;
	}
	return 0;
};


function ensure(un) {
	if(!un) {
		return '';
	}
};


function _getCachedFn(filepath, mode) {
	var ext = path.extname(filepath);
	var fnModule = filepath.replace(ext, '.js');
	fnModule = path.resolve(fnModule);
	if(mode == 'development') { //if 'development' mode alway update the template fn
		delete require.cache[fnModule];
	}
	var fn = function() {
		return filepath + 'is not compiled'
	};
	try {
		fn  = require(fnModule);
	} catch(err) {
		console.log('module not find: ', fnModule, ' is not compiled!')
	}
	fn.prototype = _inner_func_;

	return fn;
};

function include(filepath, data) {
	var ext = path.extname(filepath);
	var fnModule = filepath.replace(ext, '.js');
	fnModule = path.resolve(fnModule);
	var fn  = require(fnModule);
	fn.prototype = _inner_func_;
	return new fn(data);
};
// some method can be used by developer
// metamorphosis prefix

var _inner_func_ = {
	trim: trim,
	escape: escape,
	count: count,
	ensure: ensure,
	include: include
};

// INNER FUNCTION END



// UTILS START
/**
 * utils function extend
 */
function _extend(a, b) {
	b || (b = {});
	for (var p in b) {
		a[p] = b[p];
	}
	return a;
};

function _plainText(str, start, end) {
	return RENDER_ADDITION_START + str.slice(start, end).replace(_escaper, function(match) {
		return '\\' + _escapes[match];
	}) + RENDER_ADDITION_END + RENDER_LINE_BREAK;
};
// UTILS END

function _cleanComment(str) {
	return str.replace(_basicMather['_comment'], '');
};

function _doModuleCache(filepath, content, mode) {
	// development or cache
	var cacheTpl = filepath;
	var ext = path.extname(cacheTpl);
	cacheTpl = cacheTpl.replace(ext, '.js');
	if (mode == 'development') {
		if (!fs.existsSync(cacheTpl)) {
			mkdirp.sync(path.dirname(cacheTpl));
		}
		// development the modbule and override it andway;
		fs.writeFileSync(cacheTpl, 'module.exports ' + '= ' + content, 'utf8');
		return true;
	} else if(mode == 'production') {
		return true;
	}
	return false;
};

function _pipeAnalyze(comp) {
	var input = '';
	var compute = comp.replace(/\s/g, '').replace(/\|+/,'|').replace(/\|$/, '').split('|')
	,	varName = compute.shift();
	function toInnerFunc(name) {
		return	RENDER_VAR_PREFIX + name;
	};
	if (varName) {
		// var varRef = " $_data_['" + varName + "'] ";
		var varEqual = varName + " = ";
		for(var i=0, len = compute.length; i< len; i++) {
			if(compute[i]) {
				input += varEqual + toInnerFunc(compute[i]) + "(" + varName + ")" + RENDER_LINE_BREAK;
			}
		}
		input += RENDER_ADDITION_VAR + varName + RENDER_LINE_BREAK;
	}
	return {
		input: input,
		varName: varName,
		pipes: compute
	};
};


function Template(options) {
	this.options = _extend(_config, options);
	this.init();
};

function _throwError(err) {
	err = err || {msg: '_throwError', more: ''};
	var showInfo = err;
	if (typeof err !== 'string') {
		showInfo = '';
		for(var pro in err) {
			showInfo += pro + ': ' + err[pro] + '\n';
		}
	}
	if (GLOBAL_ERROR_TYPE == 'string') {
		throw showInfo;
	} else {
		throw err;
	}
};

_extend(Template.prototype, {
	helper: function(name, fn, override) {
		if(name in _inner_func_) {
			if (override) {
				_inner_func_[name] = fn;
				return true;
			}
			return false
		} else {
			_inner_func_[name] = fn;
			return true;
		}
	},
	config: function(opts) {
		this.options = _extend(this.options, opts);
		// fix ext
		if(!/\./.test(this.options.extName)) {
			this.options.extName = '.' + this.options.extName;
		}
		GLOBAL_ERROR_TYPE = this.options.errorType;
		_inner_func_[RENDER_LOCAL_NAME] = this.options['local'] || {mode: process.env['NODE_ENV']};
	},
	/*
	 *get the child block object array
	 *get the parent file block object array
	 *merge block-pairs
	 *make the new merged content
	 * @param  {[type]} child  [description]
	 * @param  {[type]} parent [description]
	 * @return {[type]} source [description]
	*/

	mergeBlock: function (parentSource, childSource) {
		var extendsMatch = _commandMatcher['_extends'].exec(parentSource);
		if (extendsMatch) {
			var parentSource = this._readFileContent(extendsMatch[2]);
			if (!this.options.keepComments) {
				parentSource = _cleanComment(parentSource);
			}
			var childSource = source;
			source = this.mergeBlock(parentSource, childSource);
		}
		var source = parentSource
		, childBlockMap = {}
		, parentBlockMap = {}
		, blockReg = _commandMatcher['_block']
		, match = null;
		var childBlockReg = new RegExp(blockReg.source, 'g');
		while (match = childBlockReg.exec(childSource)) {
			var content = match[4]
				, operator = match[3]
				, name = match[2];
			childBlockMap[name] = {
				name: name,
				content: content,
				operator: operator
			};
		}
		match =  null;
		var parentBlockReg = new RegExp(blockReg.source, 'g');
		while (match = parentBlockReg.exec(parentSource)) {
			var content = match[4]
				, operator = match[3]
				, name = match[2]
				, blockObj = {
					name: name,
					content: content,
					operator: null,
					src: match[0]
				};
			parentBlockMap[name] = blockObj;

			// do merge
			childBlockObj =  childBlockMap[name];

			if (childBlockObj) { // 找到对应block，并切merge
				var operator = childBlockObj['operator'] || 'replace';
				var precessSrc = '';
				// 对parent blockObj进行处理
				switch(trim(operator)) {
					case 'append':
						blockObj['content'] = blockObj['content'] + childBlockObj['content'];
						break;
					case 'prepend':
						blockObj['content'] = childBlockObj['content'] + blockObj['content'];
						break;
					case 'replace':
					case 'hidden':
					default:
						blockObj['content'] = childBlockObj['content'];
						break;
				}
			}
			// 删除block标记
			source = source.replace(blockObj['src'], blockObj['content']);
		}
		// fs.writeFileSync('./xxx.html', source, 'utf8');
		return source;
	},
	getCacheDir: function () {
		return this.options.cacheDir || GLOBAL_CACHE_DIRECTORY;
	},
	_readFileContent: function (name) {
		var filepath = path.resolve(this.options.src, name);
		var ext = path.extname(filepath) || this.options.extName;
		var readPath = path.extname(filepath) ? filepath: (filepath + ext);
		var content = fs.readFileSync(readPath, 'utf8');
		return content;
	},
	init: function() {
		if (!/^\./.test(this.options['extName'])) {
			this.options['extName'] = '.' + this.options['extName'];
		}

	},
	renderFile: function(name, data) {
		var filepath = path.resolve(this.options.src, name);
		var mode = this.getENV();
		if (mode !== 'development') { //require module directly if not 'development' mode
			var cacheDir =  this.getCacheDir();
			var tempPath = path.join(cacheDir, name);
			var renderFn = _getCachedFn(tempPath, mode);
			return data ? ((new renderFn(data))+ ''): renderFn;
		}
		if(!fs.existsSync(filepath)) { //if 'development' mode
			_throwError('no such file ' + filepath);
		} else {
			var content = fs.readFileSync(filepath, 'utf8');
			return this.render(content, data, name);
		}
	},
	render: function(source, data, name) {
		if(data) {
			return this.compile(source, name)(data);
		} else {
			return this.compile(source, name);
		}
	},
	compile: function (source, name) {
		// syntax analysis
		var raw = this.matchEngine(source, name);
		var Render = new Function('$_data_', raw);
		if (name) {
			var mode = this.getENV();
			var cacheDir =  this.getCacheDir();
			var tempPath = path.join(cacheDir, name);

			if(!_doModuleCache(tempPath, Render.toString(), mode)) {
				_throwError('env must be development or production');
			}
			var renderFn = _getCachedFn(tempPath, mode);
			return function(data) {
				return new renderFn(data) + '';
			};
		} else {
			return function(data) {
				return new Render(data) + '';
			};
		}
	},
	getENV: function() {
		return this.options.env;
	},
	/**
	 * [matchEngine description]
	 * @param  {[type]} source [description]
	 * @return {[type]}        [description]
	 */
	matchEngine: function (source, _currentFile) {
		// clean comment in the source string
		if (!this.options.keepComments) {
			source = _cleanComment(source);
		}
		//specify the syntax ingredient in the source
		var reg = new RegExp([
				// (_commandMatcher['_block'] || _noMatch).source,
				(_basicMather['_evaluate'] || _noMatch).source,
				(_basicMather['_interpolate'] || _noMatch).source,
				/$/.source
			].join('|'), 'g');

		var m = null
			, lastIndex = 0
			, $out = RENDER_STRING_DECLATION
			, $headerVarDeclare = ['var ']
			, $headerFuncDeclare = [
				'var ',
				RENDER_UTILS_OBJECT + ' = this,',
				REFER_HELPER_NAME + ' = this,',
				RENDER_INCLUDE_METHOD + ' = ' + RENDER_UTILS_OBJECT + '.include,',
				RENDER_LOCAL_NAME + ' = this.' + RENDER_LOCAL_NAME
			]
			, $temp = $out;
		var includeReg = _commandMatcher['_include']
			, blockReg = _commandMatcher['_block']
			, literalReg = _commandMatcher['_literal']
			, extendsReg = _commandMatcher['_extends'];
		var _this = this;

		// @START if extends, do extends firstly
		var extendsMatch = _commandMatcher['_extends'].exec(source);
		if (extendsMatch) {
			var parentFile = extendsMatch[2];
			var parentSource = this._readFileContent(parentFile);
			var childSource = source;
			source = this.mergeBlock(parentSource, childSource);
		}
		// @END if extends, do extends firstly

		// @START normal match
		source.replace(reg, function(m, _ev, _in, index, input) {
			if (_ev) {
				// get command type
				var cmdReg = new RegExp(_commandMatcher['_cmdSet'].source)
					, cmdType = cmdReg.exec(m)
					, term = null;
					cmdType = cmdType && cmdType[1]
				switch(cmdType) {
					case 'extends':
						term = blockReg.exec(m);
						_throwError({
							more: term,
							msg: ' too many extends!',
							error_code: ERROR_CODE.UNIQUE_COMMAND_LIMITED,
							filename: _currentFile
						});
						break;

					case 'block':
						term = blockReg.exec(m);
						_throwError({
							error_code: ERROR_CODE.CHILD_TMPL_NEEDED,
							msg: '\'block\' without \'extends\' in ',
							more: term,
							filename: _currentFile
						});
						break;

					case 'literal':
						term = literalReg.exec(m);
						var literalStr = m[1] || '';
						$temp += _plainText(literalStr, 0, literalStr.length);
						_throwError({
							error_code: ERROR_CODE.NOT_SUPPORT,
							msg: 'literal not support now, please wait!',
							more: m,
							filename: 'see ' + _currentFile + (parentFile? ' or ' + parentFile: '')
						});
						break;

					case 'include':
						term = includeReg.exec(m);
						if(!term) {
							_throwError({
								error_code: ERROR_CODE.UNWANTED_EXTENDS,
								msg: 'unexpected `include` command syntax, may be \' and " both exists, that is not allowed!',
								more: m,
								filename: 'see ' + _currentFile + (parentFile? ' or ' + parentFile: '')
							});
						}
						var file = term[2];
						var argv = term[4];
						var ext = path.extname(file) || _this.options.extName;
						var includeFile = path.extname(file) ? file: (file + ext);
						var cacheDir = _this.getCacheDir();
						// recursive
						_this.renderFile(includeFile);

						$temp +=  _plainText(source, lastIndex, index);
						$temp += RENDER_ADDITION_VAR + RENDER_INCLUDE_METHOD + "('" + path.join(cacheDir, includeFile) + "', " + argv + ")" + RENDER_LINE_BREAK;
						lastIndex = index + m.length;
						break;

					default: // <% expression %>
						$temp += _plainText(source, lastIndex, index);
						$temp += _ev + '\n';
						lastIndex = index + m.length;
						break;
				}
			} else {
				$temp +=  _plainText(source, lastIndex, index) ;
				// eof
				if (_in) {
					var rs = _pipeAnalyze(_in),
						varName = rs['varName'],
						pipes = rs['pipes'];
					$temp += rs['input'];
					if (!/[\[\]\.'"<>]/.test(varName) && $headerVarDeclare.indexOf(varName + ',') == -1) {
							$headerVarDeclare.push(varName + ',');
					}
					for(var i = 0; i< pipes.length; i++) {
						var declItem = RENDER_VAR_PREFIX + pipes[i] + ' = ' + RENDER_UTILS_OBJECT + '.' + pipes[i] + ',';
						if ($headerFuncDeclare.indexOf(declItem) == -1) {
							$headerFuncDeclare.push(declItem);
						}
					}
				}
				lastIndex = index + m.length;
			}
			return m;
		});
	 	if($headerFuncDeclare.length > 1) {
		 	$headerFuncDeclare = $headerFuncDeclare.join('').replace(/,$/,';');
		 	$out += $headerFuncDeclare + '\n';
	 	}
	 	if($headerVarDeclare.length > 1) {
		 	$headerVarDeclare = $headerVarDeclare.join('').replace(/,$/,';');
		 	$out += $headerVarDeclare + '\n';
	 	}
	 	$out += RENDER_WITH_CONTEXT_START + $temp + RENDER_WITH_CONTEXT_END + RENDER_RETURN;

	 	// console.log($out);
		return $out;
	}
});

var template = new Template();

// templateInstance.Template = Template;

module.exports = template;






### A node template, best choice.

## * Feature
* block、extends、include、literal command supported, with syntax-sugar and smarty-like tags

* pipe filters compute with **symbol**  '|'

* rumtime stably, ensure your empty varible run stably

## * usage

### **basic** syntax

```
<%
	var a = 12;
	var de = null;
	var list = [1,2,3];
%>
<% if(a) { %>
	<div>${name} </div>
	<div>unknow variable: ${wo_wo} </div>
<% } %>
<%for(var i=0; i <list.length; i++) {%>
	<div>${list[i]}</div>
<%}%>
```

### **include** command

```
<div id="main">
    <% var itemObj = {} %>
	<% include name='test/li.html' var='itemObj' /%>
</div>
```

* or, just include a tpl module without varaible


```
<div id="main">
    <%var itemObj = {} %>
	<%include name='test/li.html'  /%>
</div>
```

### **extends** & **block** command

* *parent.html*

```
<head>
	<meta charset="UTF-8">
	<title>extend</title>
	<%block name='css_head_base' %>
		<link rel="stylesheet" href="index.css">
	<%/block%>
	<%block name="js_head_base"%>
		<script src='a.js'></script>
		<script src='b.js'></script>
	<%/block%>
</head>
```

* *child.html*

```
<%extends 'parent.html' /%>
<%block name='js_head_base' append%>
	<script src="page.js"></script>
	<script>
		alert(1);
	</script>
<%/block%>
<%block name='js_head_base' append%>
	.body {
		background: red;
	}
<%/block%>
```

###  **literal** command

```
<%literal%>
	<script>
		var a = '<% I am just string,  do NOT kill me, <%please%> ${titter} %>';
	</script>
<%/literal%>
```

#### A template engine do what

* just make a **template string** below

```
<ul>
  <%for (var i =0 ; ) {%>
  	<li></li>
  <%}%>
  <% var  a = 3;%>
</ul>
```

* to another string, **function body string**

```
var str =
'
	var $out= "<ul>";
	for (var i =0 ;... ) {
		$out += "<li></li>"
	}
	$out += "</ul>"
'
```

* then we get the **render** function, like this~

```
Render = new Function(str)
```

## the compile princeple




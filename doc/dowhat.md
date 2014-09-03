1. compile basic syntax content
2. compile command and get 'relative files'
3. compile 'relative files'
4. if 'include command' appears, a compile function module come into being
5. if 'extends command' do block merge and compile



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


<?php 
if ($_SERVER['REQUEST_METHOD'] === 'POST') $success = true;
?>

<h1><?=$title = 'Forms'?></h1>

<hr>
<div style="display: flex;">
	<div class="inflex">
		<p><b>$_GET</b></p>
		<pre><?php print_r($_GET)?></pre>
	</div>
	<div class="inflex">
		<p><b>$_POST</b></p>
		<pre><?php print_r($_POST)?></pre>
	</div>
	<div class="inflex">
		<p><b>$_FILES</b></p>
		<pre><?php print_r($_FILES)?></pre>
	</div>
	<div class="inflex">
		<p><b>php://input</b></p>
		<pre><?=file_get_contents('php://input')?></pre>
	</div>
</div>

<hr>
<h2>GET</h2>
<form method="get" data-oa>
	<label>getparam = </label>
	<input type="text" name="getparam" value="">
	<input type="submit" value="Send">
</form>

<hr>
<h2>POST</h2>
<form method="post" data-oa>
	<label>postparam</label>
	<input type="text" name="postparam" value="">
	<input type="submit" value="Send">
</form>

<hr>
<h2>POST with file</h2>
<form method="post" data-oa>
	<label>file = </label>
	<input type="file" name="file" value="" accept=".txt">
	<input type="submit" value="Send">
</form>

<hr>
<h2>POST — JS</h2>
<pre class="text-start"><code>
var myFormData = new FormData()
myFormData.append('x', 1)
myFormData.append('y', 2)
document.getElementById('sendjspost').onclick = e => ODEAJAX.doAjax({
	data: myFormData,
	method: 'post',
	url: '/forms',
})
</code></pre>
<button id="sendjspost">Send</button>
<script>
	var myFormData = new FormData()
	myFormData.append('x', 1)
	myFormData.append('y', 2)
	document.getElementById('sendjspost').onclick = e => ODEAJAX.doAjax({
		data: myFormData,
		method: 'post',
		url: '/forms',
	})
</script>

<hr>
<h2>POST — JS</h2>
<pre class="text-start"><code>
document.getElementById('sendjspost1').onclick = e => ODEAJAX.doAjax({
	data: 'a=1&b=2',
	enctype: 'application/x-www-form-urlencoded',
	method: 'post',
	url: '/forms',
})
</code></pre>
<button id="sendjspost1">Send</button>
<script>
	document.getElementById('sendjspost1').onclick = e => ODEAJAX.doAjax({
		data: 'a=1&b=2',
		enctype: 'application/x-www-form-urlencoded',
		method: 'post',
		url: '/forms'
	})
</script>

<button id="sendjspost1" class="btn btn-primary">Send</button>
<script>
	document.getElementById('sendjspost1').onclick = e => ODEAJAX.doAjax('forms', {
		data: 'a=1&b=2',
		enctype: 'application/x-www-form-urlencoded',
		method: 'post',
		target: document.getElementById('result'),
		scroll: e.target,
	})
</script>
<button id="sendjspost" class="btn btn-primary">Send</button>
<script>
	var myFormData = new FormData()
	myFormData.append('x', 1)
	myFormData.append('y', 2)
	document.getElementById('sendjspost').onclick = e => ODEAJAX.doAjax({
		data: myFormData,
		method: 'post',
		target: document.getElementById('result'),
		url: 'forms',
	})
</script>
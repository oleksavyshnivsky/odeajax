<form method="post" action="forms" data-oa data-oa-target="#result" data-oa-scroll data-oa-history data-oa-before="myBefore">
	<input type="hidden" name="diia" value="before">
	<input type="submit" value="Send" class="btn btn-primary">
</form>
<script>
function myBefore() {
	return confirm('This is a confirmation question from the *data-oa-before* function')
}
</script>
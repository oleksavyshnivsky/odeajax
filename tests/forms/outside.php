<div class="d-flex flex-wrap justify-content-between">
	<form method="post" action="forms" data-oa data-oa-target="#result" id="some-distant-form" class="border border-1 px-2">
		Form
		<input type="hidden" name="action" value="outside">
	</form>

	<a href="javascript:void(0)" data-oa-submit="#some-distant-form">Submit (a)</a>
	<input type="submit" value="Send (input[type=submit])" class="btn btn-primary" form="some-distant-form">
	<button class="btn btn-primary" form="some-distant-form">Send (button)</button>
</div>

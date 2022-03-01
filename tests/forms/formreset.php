<form method="post" action="forms" data-oa data-oa-target="#form-formreset" data-oa-scroll data-oa-confirm="Are you sure?" data-oa-reset-on-cancel>
	<div class="form-check form-check-inline">
		<input class="form-check-input" type="checkbox" id="formreset-checkbox" name="checkbox" value="1" <?=filter_input(INPUT_POST, 'checkbox')?'checked':''?> data-oa-submit>
		<label class="form-check-label" for="formreset-checkbox">Checkbox</label>
	</div>
	<!-- <input type="submit" value="Send" class="btn btn-primary"> -->
	<input type="hidden" name="action" value="formreset">
</form>
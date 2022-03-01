<?php 

$title = 'Forms';

// ————————————————————————————————————————————————————————————————————————————————
// Function for alert generation -- for displaying via vanilla-notify.js
//	Style = 'danger' was supposed to correpond to the Bootstrap alert class. Vanilla Notify uses 'error' function for this.
//	Some other styles and functions -- success, warning, info -- are the same in Bootstrap and Vanilla Notify 
// ————————————————————————————————————————————————————————————————————————————————
function msgbox($title, $message, $style = 'danger') {
	$function = $style === 'danger' ? 'error' : $style;
	$GLOBALS['msgbox'][] = ['title' => $title, 'text' => $message, 'function' => $function];
}

// ————————————————————————————————————————————————————————————————————————————————
// Alerts 
// ————————————————————————————————————————————————————————————————————————————————
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	switch (filter_input(INPUT_POST, 'action')) {
		case 'message':
			$title = 'Some title';
			msgbox('Info', 'Some message', 'success');
			$success = true;
			break;
		case 'servererror':
			throw new Exception("Error Processing Request", 1);
			break;
		case 'formrejection':
			msgbox('Error', 'Form is rejected');
			$success = false;
			break;
		case 'sleep5':
			sleep(5);
			msgbox('Info', '5s passed', 'success');
			$success = true;
			break;
		case 'timeout':
			sleep(5);
			msgbox('Info', 'This supposed to be timeout', 'warning');
			$success = true;
			break;
		default:
			$success = true;
	}	
}

$formexamples = [
	'get'	=>	'GET',
	'post'	=>	'POST',
	'postwfile'	=>	'POST with file',
	'postjs'	=>	'POST — JS',
	'postjs1'	=>	'POST — JS — x-www-form-urlencoded',
	'message'	=>	'Message',
	'servererror'	=>	'Server error (ugly!)',
	'formrejection'	=>	'Form rejection',
	'formreset'	=>	'Reset form if confirmation declined',
	'sleep5'	=>	'Server takes 5s to respond',
	'timeout'	=>	'Timeout (browser waits 4s, server sleeps 5s)',
	'append'	=>	'Append/Prepend',
	'before'	=>	'Additional function before request',
	'callback'	=>	'Additional function after request',
];
?>

<h1><?=$title?></h1>

<div class="row">
	<div class="col-12 col-md-6" style="max-height: 80vh; overflow: auto;">
		<?php foreach ($formexamples as $formexample => $fe_title): ?>
		<div class="card mb-3">
			<div class="card-header text-dark bg-warning "><b><?=$fe_title?></b></div>
			<div class="card-body text-end" id="form-<?=$formexample?>">
				<?php include 'tests/forms/'.$formexample.'.php' ?>
			</div>
			<div class="card-footer text-start">
				<details>
					<summary>Code</summary>
					<pre><code id="code-<?=$formexample?>"><?=e(file_get_contents('tests/forms/'.$formexample.'.php'))?></code></pre>
					<div class="text-end"><a href="javascript:copy('#code-<?=$formexample?>')" class="btn btn-primary btn-sm">Copy</a></div>
				</details>
			</div>
		</div>
		<?php endforeach ?>
	</div>
	<div class="col-12 col-md-6">
		<div class="card mb-3">
			<div class="card-header">Result</div>
			<div class="card-body text-start" id="result">
				<hr>
				<p><b>$_GET</b></p>
				<pre><?php print_r($_GET)?></pre>
				<p><b>$_POST</b></p>
				<pre><?php print_r($_POST)?></pre>
				<p><b>$_FILES</b></p>
				<pre><?php print_r($_FILES)?></pre>
				<p><b>php://input</b></p>
				<pre><?=file_get_contents('php://input')?></pre>
				<?php if ($GLOBALS['msgbox']): ?>
				<p><b>Alerts</b></p>
				<pre><?=json_encode($GLOBALS['msgbox'])?></pre>
				<?php endif ?>
				<hr>
			</div>
		</div>
	</div>
</div>


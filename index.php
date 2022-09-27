<?php

session_start();
$GLOBALS['msgbox'] = [];

// ————————————————————————————————————————————————————————————————————————————————
// Is this an AJAX request
// ————————————————————————————————————————————————————————————————————————————————
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) and $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') define('AJAX', true);

// ————————————————————————————————————————————————————————————————————————————————
// Common vars
// ————————————————————————————————————————————————————————————————————————————————
$title = 'ODE AJAX example';
$success = $_SERVER['REQUEST_METHOD'] !== 'POST';
$module = (isset($_GET['t']) and file_exists('tests/'.getSafeFileName($_GET['t']).'.php')) ? getSafeFileName($_GET['t']) : 'home';


// ————————————————————————————————————————————————————————————————————————————————
// Content
// ————————————————————————————————————————————————————————————————————————————————
ob_start();

include 'tests/'.$module.'.php';
$content = ob_get_clean();

// ————————————————————————————————————————————————————————————————————————————————
// Alerts
// ————————————————————————————————————————————————————————————————————————————————
if (isset($_SESSION['msgbox']) and !empty($_SESSION['msgbox'])) {
	$GLOBALS['msgbox'] = array_merge($_SESSION['msgbox'], $GLOBALS['msgbox']);
	unset($_SESSION['msgbox']);
}

// ————————————————————————————————————————————————————————————————————————————————
// If this is AJAX request, return JSON-structure
// ————————————————————————————————————————————————————————————————————————————————
if (defined('AJAX')) {
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode([
		'alerts'	=>	$GLOBALS['msgbox']??null,
		'html'		=>	$content,
		'title'		=>	$title,
		'success'	=>	$success,
	]);
	exit();
}


// ————————————————————————————————————————————————————————————————————————————————
// Full document
// ————————————————————————————————————————————————————————————————————————————————
?><!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?=e($title)?></title>

	<style>
		nav a {
			text-transform: uppercase;
			text-decoration: none;
		}
		pre {
			white-space: pre-wrap;       /* Since CSS 2.1 */
			white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
			white-space: -pre-wrap;      /* Opera 4-6 */
			white-space: -o-pre-wrap;    /* Opera 7 */
			word-wrap: break-word;       /* Internet Explorer 5.5+ */
		}
		.blink {
			animation-name: blink;
			animation-duration: 1s;
		}

		@keyframes blink {
			from {background-color: lightgreen;}
			to {background-color: inherit;}
		}
	</style>

	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous">
	
	<script src="vendor/docready.js"></script>
</head>
<body>
	<nav class="navbar navbar-expand-lg navbar-light bg-light">
		<div class="container-fluid">
			<a class="navbar-brand" href="#"></a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav mx-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link" href="home" data-oa>Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="a" data-oa>Page A</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="forms" data-oa>Forms</a>
					</li>
				</ul>
			</div>
		</div>
	</nav>
	<main class="container" id="main"><?=$content?></main>

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js" integrity="sha384-ODmDIVzN+pFdexxHEHFBQH3/9/vQ9uori45z4JjnFsRydbmQbmL5t1tQ0culUzyK" crossorigin="anonymous"></script>
	<script src="vendor/copytoclipboard.js"></script>
	<script src="js/notify.js?v=<?=filemtime('js/notify.js')?>"></script>
	<script src="js/odeajax.js?v=<?=filemtime('js/odeajax.js')?>"></script>
	<?php if ($GLOBALS['msgbox']): ?>
	<script>
	docReady(() => ODEAJAX.showAlerts(<?=json_encode($GLOBALS['msgbox'])?>))
	</script>
	<?php endif ?>
</body>
</html>
<?php
// ————————————————————————————————————————————————————————————————————————————————
// Functions
// ————————————————————————————————————————————————————————————————————————————————

// htmlspecialchars wrapper
function e($raw_input) { 
	return htmlspecialchars($raw_input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}


// Safe file names
function getSafeFileName($file) {
	// Remove anything which isn't a word, whitespace, number
	// or any of the following caracters -_~,;:[]().
	$file = preg_replace("([^\w\s\d\-_~,;:\[\]\(\).])", '', $file);
	// Remove any runs of periods (thanks falstro!)
	$file = preg_replace("([\.]{2,})", '', $file);

	return $file;
}

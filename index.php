<?php

// ————————————————————————————————————————————————————————————————————————————————
// Is this AJAX request
// ————————————————————————————————————————————————————————————————————————————————
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) and $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') define('AJAX', true);


// ————————————————————————————————————————————————————————————————————————————————
// Common vars
// ————————————————————————————————————————————————————————————————————————————————
$title = 'Home page';
$success = $_SERVER['REQUEST_METHOD'] !== 'POST';
$module = (isset($_GET['t']) and file_exists('tests/'.getSafeFileName($_GET['t']).'.php')) ? getSafeFileName($_GET['t']) : 'home';


// ————————————————————————————————————————————————————————————————————————————————
// Content
// ————————————————————————————————————————————————————————————————————————————————
ob_start();

include 'tests/'.$module.'.php';
$content = ob_get_clean();


// ————————————————————————————————————————————————————————————————————————————————
// If this is AJAX request, return JSON-structure
// ————————————————————————————————————————————————————————————————————————————————
if (defined('AJAX')) {
	echo json_encode([
		'title'		=>	$title,
		'html'		=>	$content,
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
	<title>ODE AJAX example</title>

	<style>
		body {
			 background-color: wheat;
			 padding: 0;
			 margin: 0;
		}
		nav {
			background-color: lightblue;
			padding: 1rem;
			margin: 0 0 1rem 0;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
		}
		nav div {
			padding: 1rem;
		}
		nav a {
			text-transform: uppercase;
			text-decoration: none;
		}
		#main {
			background-color: white;
			margin: auto;
			max-width: 1000px;
			min-height: 50vh;
			text-align: center;
			padding: 1rem;
		}
		.mb {
			margin-bottom: 1rem;
		}
		.text-start {
			text-align: left;
		}
		.inflex {
			overflow: auto;
			padding: .5rem; 
			text-align: left;
			width: 25%; 
		}
	</style>

	<link rel="stylesheet" href="vendor/vanilla-notify/vanilla-notify.css">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
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

	<script src="vendor/vanilla-notify/vanilla-notify.min.js"></script>
	<script src="js/odeajax.js?v=<?=filemtime('js/odeajax.js')?>"></script>
</body>
</html>
<?php
// ————————————————————————————————————————————————————————————————————————————————
// Functions
// ————————————————————————————————————————————————————————————————————————————————

// Очистка тексту перед HTML-виводом
function e($raw_input) { 
	if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
		return htmlspecialchars($raw_input, ENT_QUOTES | ENT_HTML401, 'UTF-8'); 
	} else {
		return htmlspecialchars($raw_input, ENT_QUOTES, 'UTF-8'); 
	}
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

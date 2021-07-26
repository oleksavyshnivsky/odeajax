<?php

if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) and $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') define('AJAX', true);
require_once 'inc/functions.php';

$title = 'Home page';
$success = $_SERVER['REQUEST_METHOD'] !== 'POST';
$module = (isset($_GET['url']) and file_exists('subpages/'.getSafeFileName($_GET['url']).'.php')) ? getSafeFileName($_GET['url']) : 'home';

ob_start();
include 'subpages/'.$module.'.php';
echo '<hr><p>Server time: '.date('H:i:s').'</p>';
$content = ob_get_clean();

if (defined('AJAX')) {
	echo json_encode([
		'title'		=>	$title,
		'html'		=>	$content,
		'success'	=>	$success,
	]);
	exit();
}

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
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

	<script src="vendor/docready.js"></script>
</head>
<body>
	<nav>
		<div><a href="/a" data-oa>Page A</a></div>
		<div><a href="/b" data-oa>Page B</a></div>
		<div><a href="/forms" data-oa>Forms</a></div>
	</nav>
	<main id="main"><?=$content?></main>

	<script src="vendor/vanilla-notify/vanilla-notify.min.js"></script>
	<script src="odeajax.js?v=<?=filemtime('odeajax.js')?>"></script>
</body>
</html>
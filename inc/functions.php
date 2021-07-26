<?php

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

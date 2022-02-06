/**
 * @file AJAX requests
 * @copyleft Oleksa Vyshnivsky <dying.escape@gmail.com> 2022
 * @license The MIT License (MIT)
 * */

// ————————————————————————————————————————————————————————————————————————————————
// Require Vanilla Notify from https://github.com/MLaritz/Vanilla-Notify
// ————————————————————————————————————————————————————————————————————————————————

// ————————————————————————————————————————————————————————————————————————————————
// Examples:
// 1) <a href="[...]" data-oa data-oa-target="#target;#main" data-oa-history data-oa-scroll="#target">[...]</a>
// 2) <form method="post" action="[...]" data-oa>[...]</form>
// 3) <form method="post" action="[...]" data-oa>[...]<a href="javascript:void(0)" data-oa-submit>[...]</a>[...]</form>
// 4) <form id="form-id" method="post" action="[...]" data-oa>[...]</form>[...] <a href="javascript:void(0)" data-oa-submit="#form-id">[...]</a>

// Attributes:
// data-oa 			— anchors and forms for which this script is made
// data-oa-target 	— element for response. Default value: "#main"
//						If a value is a semicolon-separated list, response goes into the first element found on page 
// data-oa-history	— if present (or if "data-oa-target" is "#main"), add this URL to browser history 
// data-oa-scroll	— if present, scroll to element "value" (default value: "#main")
// data-oa-submit 	— attribute for A, INPUT, SELECT nodes which must submit forms
// 						"A" node outside of needed form has to have form selector as a value (data-oa-submit="#form-id") 
// ————————————————————————————————————————————————————————————————————————————————


// ————————————————————————————————————————————————————————————————————————————————
// Support action: Dynamic script loading
// https://stackoverflow.com/a/31374433/5479761
// ————————————————————————————————————————————————————————————————————————————————
var loadJS = function(url, implementationCode, location){
	var scriptTag = document.createElement('script')
	scriptTag.src = url

	scriptTag.onload = implementationCode
	scriptTag.onreadystatechange = implementationCode

	location.appendChild(scriptTag)
}


// ————————————————————————————————————————————————————————————————————————————————
// "Main" element
// ————————————————————————————————————————————————————————————————————————————————
const MAIN = document.querySelector('#main') || document.querySelector('main') || document.querySelector('body')


// ————————————————————————————————————————————————————————————————————————————————
// 
// ————————————————————————————————————————————————————————————————————————————————
const ODEAJAX = {
	// Status to allow blocking of the parallel requests
	performing: false,
	// Base options
	baseoptions: {
		before: false,		// Function before AJAX request
		callback: false,	// Function after AJAX request
		confirm: false,		// Confirmation question
		data: false,
		history: false,		// Add to browser history
		method: 'GET',
		scroll: MAIN,	// Scroll to this element
		target: MAIN,	// Response goes here
		// enctype: 'application/x-www-form-urlencoded;charset=UTF-8',
		// url: 			// Required in options
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Read data-oa-... settings from the HTML node
	// ————————————————————————————————————————————————————————————————————————————————
	readOptions: element => {
		var options = {}
		// data-oa-before
		options.before = element.dataset.oaBefore
		// data-oa-callback
		options.callback = element.dataset.oaCallback
		// data-oa-confirm
		options.confirm = element.dataset.oaConfirm
		// data-oa-target
		// 	Complication for data-oa-target="#el-1;#el-2;..."
		var parts = element.dataset.oaTarget ? element.dataset.oaTarget.split(';') : []
		if (parts.length > 1) parts.every(t => !(options.target = document.querySelector(t)))
		if (!options.target) options.target = document.querySelector(element.dataset.oaTarget) || element.closest('[data-oa-main]') || MAIN
		// data-oa-history
		// 	If not set but the target is "main" — true
		options.history = element.hasAttribute('data-oa-history') ? true : options.target === MAIN 
		// data-oa-scroll
		//		data-oa-scroll exists and has value — it must be a selector of a scroll target
		//		data-oa-scroll exsist but has no value — we must scroll to a target
		//		data-oa-scroll does not exist but a target is MAIN — we must scroll to a target
		options.scroll = element.hasAttribute('data-oa-scroll') 
			? (element.dataset.oaScroll ? document.querySelector(element.dataset.oaScroll) : options.target)
			: false
		if (!options.scroll && options.target === MAIN) options.scroll = options.target
		// Method
		if (element.nodeName === 'FORM') options.method = (element.getAttribute('method') || 'GET').toUpperCase()	// Allow form to have an input named "method"
		// URL
		options.url = element.nodeName === 'FORM' ? element.getAttribute('action') : element.href // Allow form to have an input named "action"
		if (element.nodeName === 'FORM' && !options.url)
			options.url = options.method === 'POST' ? window.location.href : window.location.protocol + '//' + window.location.host + window.location.pathname
		// Data
		if (element.nodeName === 'FORM') {
			options.form = element
			// data-oa-reset-on-cancel
			options.oaResetOnCancel = element.dataset.oaResetOnCancel
			options.data = new FormData(element)
			if (options.data && options.method === 'GET') {
				options.url += (options.url.indexOf('?')>-1?'&':'?') + new URLSearchParams(options.data).toString()
				options.data = false
			}
		}
		//
		return options
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// AJAX call 
	// ————————————————————————————————————————————————————————————————————————————————
	doActualAjax: options => {
		return new Promise((resolve, reject) => {
			ODEAJAX.performing = true
			// Update history. Don't add duplicates
			var addedState = false
			if (options.history && options.url !== window.location.href) {
				history.pushState({'href': options.url}, '', options.url)
				addedState = true
			}
			// XHR
			var xhr = new XMLHttpRequest()
			xhr.open(options.method, options.url)
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
			if (options.enctype) xhr.setRequestHeader('Content-Type', options.enctype)
			xhr.onload = function() {
				ODEAJAX.performing = false
				if (xhr.status === 200) {
					// Update history in case of redirect
					if (options.history && xhr.responseURL !== window.location.href) 
						if (addedState)
							history.replaceState({'href': xhr.responseURL}, '', xhr.responseURL)
						else
							history.pushState({'href': xhr.responseURL}, '', xhr.responseURL)
					// Return JSON object or error
					try {
						resolve(JSON.parse(xhr.response))
					} catch (e) {
						reject(xhr)
					}
				} else {
					reject(xhr)
				}
			}
			xhr.send(options.data)
		})
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// AJAX request wrapper
	// ————————————————————————————————————————————————————————————————————————————————
	doAjax: options => {
		options = {...ODEAJAX.baseoptions, ...options}
		// Confirm request
		if (options.confirm && !confirm(options.confirm)) {
			if (options.oaResetOnCancel) options.form.reset()
			return false
		}
		// Action before request (has to return true to continue)
		if (options.before && typeof window[options.before] === 'function' && !window[options.before]()) return false
		// Do request
		ODEAJAX.doActualAjax(options).then(response => {
			ODEAJAX.showResponse(response, options)
			if (typeof window[options.callback] === 'function') window[options.callback](response, options)
			if (options.scroll) options.scroll.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
		}).catch(xhr => {
			ODEAJAX.showError(xhr, options)
		})
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Form sending
	// ————————————————————————————————————————————————————————————————————————————————
	doForm: e => {
		// No default action
		e.preventDefault()
		// No parallel requests
		if (ODEAJAX.performing) return false
		// formAction
		if (e.submitter && e.submitter.hasAttribute('formaction')) e.delegateTarget.setAttribute('action', e.submitter.formAction)
		//
		ODEAJAX.doAjax(ODEAJAX.readOptions(e.delegateTarget))
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Alerts
	// require https://github.com/MLaritz/Vanilla-Notify
	// alert = {title: "...", text: "...", function: "info|success|warning|error|notify"}
	// ————————————————————————————————————————————————————————————————————————————————
	showAlerts: alerts => {
		Array.from(alerts).forEach(alert => { 
			if (!alert.position) alert.position = vNotify.positionOption.bottomRight
			if (!alert.fadeInDuration) alert.fadeInDuration = 10

			vNotify[alert.function](alert)
		})
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Show loaded page
	// ————————————————————————————————————————————————————————————————————————————————
	showResponse: (response, options) => {
		// HTML
		if (response.success) {
			if (response.html) {
				// Downloaded HTML-document
				var doc = new DOMParser().parseFromString(response.html, 'text/html')
				// Partial HTML-document
				if (options.target.id) {
					var el = doc.getElementById(options.target.id)
					if (el) {
						response.html = el.innerHTML
						doc = el
					}
				}
				// Insert HTML
				options.target.innerHTML = response.html
				// Execute JS
				doc.querySelectorAll('script').forEach(script => {
					if (script.src) loadJS(script.src, null, options.target)
					else {
						try {
							(1,eval)(script.innerText)
						} catch (e) {}
					}
				})
				// Document title
				if (options.history) document.title = response.title ? response.title : doc.title 
			}
		}
		// Alerts
		if (response.alerts) ODEAJAX.showAlerts(response.alerts)
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// AJAX-request returned error
	// ————————————————————————————————————————————————————————————————————————————————
	showError: (xhr, options) => {
		console.error(xhr.responseText ? xhr.responseText : xhr.statusText)
		ODEAJAX.showAlerts([{
			function: 'error',
			text: xhr.responseText ? xhr.responseText : xhr.statusText,
			title: '',
			sticky: true	
		}])
		// var message = '<div class="alert alert-danger">' + (xhr.responseText ? xhr.responseText : xhr.statusText) + '</div>'
		// options.target.innerHTML = message
	}
}

// ————————————————————————————————————————————————————————————————————————————————
// Initial History action
// ————————————————————————————————————————————————————————————————————————————————
history.replaceState({href: window.location.href}, null, window.location.href)

// ————————————————————————————————————————————————————————————————————————————————
// Actions after the full page load
// ————————————————————————————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', e => {
	// ————————————————————————————————————————————————————————————————————————————————
	// Moving through history
	// ————————————————————————————————————————————————————————————————————————————————
	window.addEventListener('popstate', e => {
		// Ignoring hash changes
		if (window.location.hash) return false
		// Sending request
		ODEAJAX.doAjax({
			history: false,
			url: e.state.href,
		})
	})
	
	// ————————————————————————————————————————————————————————————————————————————————
	// "Click" events
	// ————————————————————————————————————————————————————————————————————————————————
	document.addEventListener('click', e => {
		var path = e.path || (e.composedPath && e.composedPath())
		path.every(target => {
			if (target.nodeName === 'BODY' || target.nodeName === 'HTML') return false
			if (target.hasAttribute('data-close')) {
				// ————————————————————————————————————————————————————————————————————————————————
				// "Closing" some div/section by removing innerHTML (if [data-closable] parent exists)
				//		or by going to a given URL (if [data-closable] parent doesn't exist)
				// 
				//	<section data-closable>
				// 		<button data-close>Close this section</button>
				//	</section>
				//	
				//	<div id="main">
				//		<button data-close="https://...">Close this section</button>
				//	</div>
				// ————————————————————————————————————————————————————————————————————————————————
				var el = target.closest('[data-closable]')
				if (el) el.innerHTML = ''
				else if (target.dataset.close) ODEAJAX.doAjax({url: target.dataset.close, history: true})
				return false
			} else if (target.nodeName === 'A' && target.hasAttribute('data-oa')) {
				// ————————————————————————————————————————————————————————————————————————————————
				// AJAX page load
				// <a href="https://..." data-oa>...</a>
				// ————————————————————————————————————————————————————————————————————————————————
				// Middle/right mouse button click, shift|alt|meta|ctrl — default action
				if (e.button > 0 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return true
				e.preventDefault()
				e.delegateTarget = target
				if (ODEAJAX.performing) return false
				ODEAJAX.doAjax(ODEAJAX.readOptions(e.delegateTarget))
				return false
			} else if (target.nodeName === 'A' && target.hasAttribute('data-oa-submit')) {
				// ————————————————————————————————————————————————————————————————————————————————
				// Form submit with anchor
				// <form data-oa>
				// 	<a href="javascript:void(0)" data-oa-submit>...</a>
				// </form>
				// 
				// <form id="form1" data-oa>...</form>
				// <a href="javascript:void(0)" data-oa-submit="#form1">...</a>
				// ————————————————————————————————————————————————————————————————————————————————
				e.delegateTarget = target.dataset.oaSubmit ? document.querySelector(target.dataset.oaSubmit) : target.closest('form')
				ODEAJAX.doForm(e)
				return false
			}
			return true
		})
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// "Submit" event for:
	// <form data-oa>
	// ————————————————————————————————————————————————————————————————————————————————
	document.addEventListener('submit', e => {
		if (e.target.hasAttribute('data-oa')) {
			e.delegateTarget = e.target
			ODEAJAX.doForm(e)
		}
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// "Change" event for:
	// <select [form=...] data-oa-submit></select>
	// <input type="checkbox" [form=...] data-oa-submit>
	// ————————————————————————————————————————————————————————————————————————————————
	document.addEventListener('change', e => {
		if (e.target.hasAttribute('data-oa-submit')) {
			e.delegateTarget = e.target.form
			ODEAJAX.doForm(e)
		}
	})
})

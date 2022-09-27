/**
 * @file AJAX requests
 * @copyleft Oleksa Vyshnivsky <dying.escape@gmail.com> 2022
 * @license The MIT License (MIT)
 * @version 1.0.4
 * */

// ————————————————————————————————————————————————————————————————————————————————
// Require notify.js
// ————————————————————————————————————————————————————————————————————————————————

// ————————————————————————————————————————————————————————————————————————————————
// Examples:
// 1) <a href="[...]" data-oa data-oa-target="#target;#main" data-oa-history data-oa-scroll="#target">[...]</a>
// 2) <form method="post" action="[...]" data-oa>[...]</form>
// 3) <form method="post" action="[...]" data-oa>[...]<a href="javascript:void(0)" data-oa-submit>[...]</a>[...]</form>
// 4) <form id="form-id" method="post" action="[...]" data-oa>[...]</form>[...] <a href="javascript:void(0)" data-oa-submit="#form-id">[...]</a>

// Attributes:
// data-oa 			— anchors and forms for which this script is made
// data-oa-before	— function to execute before AJAX request. If returns false, request is cancelled
// data-oa-callback	— function to execute after a successful AJAX request, after a showResponse function
// data-oa-confirm 	— text of a confirmation question
// 						If a user declines a confirmation, AJAX request is not executed
// data-oa-target 	— selector of an element which will receive the HTML part of response. Default value: "#main"
//						If a value is a semicolon-separated list ("#submain;#main"), response goes into the first element found on page 
// 						If not given, response goes to the closest [data-oa-main] element, and if such doesn't exist — to the #main
// data-oa-history	— if present (or if "data-oa-target" is "#main"), this URL will be added to browser history
// data-oa-scroll	— selector of an element that will be scrolled into view after a successful request. 
// 						If present without value, data-oa-target element will be scrolled into view 
// data-oa-submit 	— attribute for A, INPUT, SELECT nodes which must submit forms
// 						"A" node outside of needed form has to have a form selector as a value (data-oa-submit="#form-id") 
// data-oa-timeout	— timeout duration of AJAX request in ms, 30000ms by default
// data-oa-append	— scroll to the bottom of the *data-oa-target* element, append the HTML response instead of inserting
// data-oa-prepend	— scroll to the top of the *data-oa-target* element, prepend the HTML response instead of inserting
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
		append: false,		// Append HTML-response instead of inserting
		before: false,		// Function before AJAX request
		callback: false,	// Function after AJAX request
		confirm: false,		// Confirmation question
		data: false,
		history: false,		// Add to browser history
		method: 'GET',
		prepend: false,		// Prepend HTML-response instead of inserting
		scroll: MAIN,	// Scroll to this element
		target: MAIN,	// Response goes here
		timeout: 30000,	// ms
		// enctype: 'application/x-www-form-urlencoded;charset=UTF-8',
		// url: 			// Required in options
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Read data-oa-... settings from the HTML node
	// ————————————————————————————————————————————————————————————————————————————————
	readOptions: element => {
		var options = {}
		// data-oa-append
		options.append = element.hasAttribute('data-oa-append')
		// data-oa-prepend
		options.prepend = element.hasAttribute('data-oa-prepend')
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
		// data-oa-timeout
		if (parseInt(element.dataset.oaTimeout)) options.timeout = parseInt(element.dataset.oaTimeout)
		// Method
		if (element.nodeName === 'FORM') options.method = (element.getAttribute('method') || 'GET').toUpperCase()	// Allow form to have an input named "method"
		// Data
		if (element.nodeName === 'FORM') {
			options.form = element
			// data-oa-reset-on-cancel
			options.oaResetOnCancel = element.hasAttribute('data-oa-reset-on-cancel')
			if (options.method !== 'GET') options.data = new FormData(element)
		}
		//
		return options
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// AJAX request wrapper
	// ————————————————————————————————————————————————————————————————————————————————
	doAjax: (url, options) => {
		// No duplicate requests
		if (ODEAJAX.performing) return false

		options = {...ODEAJAX.baseoptions, ...options}
		
		// Confirm request
		if (options.confirm && !confirm(options.confirm)) {
			if (options.oaResetOnCancel) options.form.reset()
			return false
		}
		
		// Action before request (has to return true to continue)
		if (options.before && typeof window[options.before] === 'function' && !window[options.before]())
			return false
		
		// Update history. Don't add duplicates
		var addedState = false

		// GET form action
		if (options.data && options.method === 'GET') {
			url += (url.indexOf('?')>-1?'&':'?') + new URLSearchParams(options.data).toString()
			options.data = false
		}
		
		// URL preparing
		url = new URL(url, window.location.href).href
		if (options.history && url !== window.location.href) {
			history.pushState({'href': url}, '', url)
			addedState = true
		}
		
		// Headers
		const myHeaders = new Headers()
		myHeaders.append('X-Requested-With', 'XMLHttpRequest')
		if (options.enctype) myHeaders.append('Content-Type', options.enctype)
		
		// Fetch options
		const fetchOptions = {}
		fetchOptions.method = options.method
		fetchOptions.headers = myHeaders
		if (options.method !== 'GET' && options.data) fetchOptions.body = options.data
		if (options.timeout) fetchOptions.signal = AbortSignal.timeout(options.timeout) 
		
		// fetch
		ODEAJAX.performing = true
		fetch(url, fetchOptions).then(async response => {
			ODEAJAX.performing = false
			if (response.ok) {
				// Update history in case of redirect
				if (options.history && response.url !== window.location.href) 
					if (addedState)
						history.replaceState({'href': response.url}, '', response.url)
					else
						history.pushState({'href': response.url}, '', response.url)
				//
				const contentType = response.headers.get('content-type')
				if (!contentType || !contentType.includes('application/json')) {
					ODEAJAX.showError(await response.text(), options)
				} else {
					var json = await response.json()
					// Show response
					ODEAJAX.showResponse(json, options)
					// Execute callback function
					if (typeof window[options.callback] === 'function') window[options.callback](response, options)
					// Scroll into view
					if (options.scroll === true) options.scroll = options.target
					if (options.scroll) options.scroll.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
				}
			} else {
				ODEAJAX.showError(await response.text(), options)
			}
		}).catch(error => {
			ODEAJAX.performing = false
			ODEAJAX.showError(error, options)
		})
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Form sending
	// ————————————————————————————————————————————————————————————————————————————————
	doForm: e => {
		// No default action
		e.preventDefault()
		// formAction
		if (e.submitter && e.submitter.hasAttribute('formaction'))
			e.delegateTarget.setAttribute('action', e.submitter.formAction)
		var url = e.delegateTarget.getAttribute('action')
		var is_get = e.delegateTarget.getAttribute('method').toUpperCase() === 'GET'
		if (!url)
			url = is_get
				? window.location.protocol + '//' + window.location.host + window.location.pathname
				: window.location.href
		if (is_get)
			url += (url.indexOf('?')>-1?'&':'?') + new URLSearchParams(new FormData(e.delegateTarget)).toString()
		
		//
		ODEAJAX.doAjax(url, ODEAJAX.readOptions(e.delegateTarget))
	},

	// ————————————————————————————————————————————————————————————————————————————————
	// Alerts
	// require https://github.com/MLaritz/Vanilla-Notify
	// alert = {title: "...", text: "...", function: "info|success|warning|danger|notify"}
	// ————————————————————————————————————————————————————————————————————————————————
	showAlerts: alerts => {
		Array.from(alerts).forEach(alert => vNotify[alert.function](alert))
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
				// Insert HTML (or append, or prepend)
				if (options.append) {
					options.target.scrollIntoView({block: 'end', inline: 'end'})
					options.target.insertAdjacentHTML('beforeend', response.html)
				}
				else if (options.prepend) {
					options.target.scrollIntoView({block: 'start', inline: 'start'})
					options.target.insertAdjacentHTML('afterbegin', response.html)
				} 
				else
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
	// AJAX request returned an error
	// ————————————————————————————————————————————————————————————————————————————————
	showError: (error, options) => {
		options.target.innerHTML = error ? error : 'Timeout'
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
		ODEAJAX.doAjax(e.state.href, {history: false})
	})
	
	// ————————————————————————————————————————————————————————————————————————————————
	// "Closing" some div/section by removing innerHTML (if [data-closable] parent exists)
	//		or by going to a given URL (if [data-closable] parent doesn't exist)
	// 
	//	<section data-closable>
	// 		<button data-close>Close this section</button>
	//	</section>
	// 	
	// 	~~~ or ~~~
	// 
	//	<div id="main">
	//		<button data-close="https://...">Close this section</button>
	//	</div>
	// ————————————————————————————————————————————————————————————————————————————————
	document.querySelector('body').addEventListener('click', e => {
		var target = e.target.closest('[data-close]')
		if (target) {
			var el = target.closest('[data-closable]')
			if (el)
				el.innerHTML = ''
			else if (target.dataset.close)
				ODEAJAX.doAjax(target.dataset.close)
		}
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// AJAX page load
	// <a href="https://..." data-oa>...</a>
	// ————————————————————————————————————————————————————————————————————————————————
	document.querySelector('body').addEventListener('click', e => {
		// Middle/right mouse button click, shift|alt|meta|ctrl — default action
		if (e.button > 0 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return true
		var target = e.target.closest('a[data-oa]')
		if (target) {
			e.preventDefault()
			ODEAJAX.doAjax(target.href, ODEAJAX.readOptions(target))
		}
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// Form submit with anchor
	// <form data-oa>
	// 	<a href="javascript:void(0)" data-oa-submit>...</a>
	// </form>
	// 
	// <form id="form1" data-oa>...</form>
	// <a href="javascript:void(0)" data-oa-submit="#form1">...</a>
	// ————————————————————————————————————————————————————————————————————————————————
	document.querySelector('body').addEventListener('click', e => {
		var target = e.target.closest('a[data-oa-submit]')
		if (target) {
			e.delegateTarget = target.dataset.oaSubmit ? document.querySelector(target.dataset.oaSubmit) : target.closest('form')
			ODEAJAX.doForm(e)
		}
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// "Submit" event for:
	// <form data-oa>
	// ————————————————————————————————————————————————————————————————————————————————
	document.querySelector('body').addEventListener('submit', e => {
		if (e.target.hasAttribute('data-oa')) {
			e.delegateTarget = e.target
			ODEAJAX.doForm(e)
		}
	})

	// ————————————————————————————————————————————————————————————————————————————————
	// "Change" event for:
	// <select [form=...] data-oa-submit>
	// <input [form=...] data-oa-submit>
	// <textarea [form=...] data-oa-submit>
	// ————————————————————————————————————————————————————————————————————————————————
	document.querySelector('body').addEventListener('change', e => {
		if (e.target.hasAttribute('data-oa-submit')) {
			e.delegateTarget = e.target.form
			ODEAJAX.doForm(e)
		}
	})
})

/**
 *  Oleksa Vyshnivsky a.k.a. ODE
 * 	dying.escape@gmail.com
*/ 

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
// URL actions
// ————————————————————————————————————————————————————————————————————————————————
const ODEURL = new Object
ODEURL.parse = link => {
	var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
	var parts = parse_url.exec(link)
	return parts
}
ODEURL.build = parts => {
	return parts[1] + ':' + parts[2] + parts[3] 
		+ (parts[4] ? ':' + parts[4] : '') 
		+ (parts[5] ? '/' + parts[5] : '') 
		+ (parts[6] ? '?' + parts[6] : '') 
		+ (parts[7] ? '#' + parts[7] : '')
}
ODEURL.getParameter = (link, name) => {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(link)||[,null])[1]
	)
}
ODEURL.removeParameter = (link, name) => {
	var r = new RegExp("&?"+name+"=([^&]$|[^&#]*)", 'i')
	return link.replace(r, '')
}
ODEURL.addParameter = (link, name, value) => {
	link = ODEURL.removeParameter(link, name)
	var paramStr = name + "=" + encodeURIComponent(value)

	var parts = ODEURL.parse(link)
	if (parts[6]) parts[6] += '&'
	else parts[6] = ''
	parts[6] += paramStr
	
	return ODEURL.build(parts)
}

// ————————————————————————————————————————————————————————————————————————————————
// 
// ————————————————————————————————————————————————————————————————————————————————
const ODEAJAX = new Object
// Block parallel requests
ODEAJAX.performing = false
// Base options
ODEAJAX.baseoptions = {
	before: false,		// Function before AJAX request
	callback: false,	// Function after AJAX request
	confirm: false,		// Confirmation question
	data: false,
	history: true,		// Add to browser history
	method: 'GET',
	scroll: document.querySelector('#main'),	// Scroll to this element
	target: document.querySelector('#main'),	// Response goes here
	// url: 			// Required in options
}

// ————————————————————————————————————————————————————————————————————————————————
// data-oa-... settings
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.readOptions = element => {
	var options = {}
	options.before = element.dataset.oaBefore
	options.callback = element.dataset.oaCallback
	options.confirm = element.dataset.oaConfirm
	// Complication for response target data-oa-target="#el-1;#el-2;..."
	var parts = element.dataset.oaTarget ? element.dataset.oaTarget.split(';') : []
	if (parts.length > 1)
		parts.every(t => !(options.target = document.querySelector(t)))
	else 
		options.target = document.querySelector(element.dataset.oaTarget) || element.closest('[data-oa-main]') || document.querySelector('#main')
	// 
	options.scroll = element.hasAttribute('data-oa-scroll') 
		? (element.dataset.oaScroll ? document.querySelector(element.dataset.oaScroll) : options.target)
		: false
	if (!options.scroll && options.target.id === 'main') options.scroll = options.target
	// 
	options.url = element.nodeName === 'FORM' ? element.action : element.href
	options.history = options.target.id === 'main' ? true : element.hasAttribute('data-oa-history')
	if (element.nodeName === 'FORM') {
		options.form = element
		options.oaResetOnCancel = element.dataset.oaResetOnCancel
		options.method = element.method.toUpperCase()
		options.data = new FormData(element)
		if (options.data && options.method === 'GET') {
			options.url += (options.url.indexOf('?')>-1?'&':'?') + new URLSearchParams(options.data).toString()
			options.data = false
		}
	}
	return options
}

// ————————————————————————————————————————————————————————————————————————————————
// 
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.doActualAjax = options => {
	return new Promise((resolve, reject) => {
		ODEAJAX.performing = true
		// Update history
		if (options.history && options.url !== window.location.href) history.pushState({'href': options.url}, '', options.url)
		// XHR
		var xhr = new XMLHttpRequest()
		xhr.open(options.method, options.url)
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
		xhr.onload = function() {
			ODEAJAX.performing = false
			if (xhr.status === 200) {
				// Update history in case of redirect
				if (options.history && xhr.responseURL !== window.location.href) history.replaceState({'href': xhr.responseURL}, '', xhr.responseURL)
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
}

// ————————————————————————————————————————————————————————————————————————————————
// AJAX request wrapper
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.doAjax = options => {
	options = Object.assign(ODEAJAX.baseoptions, options)
	// Confirm request
	if (options.confirm && !confirm(options.confirm)) {
		if (options.oaResetOnCancel) option.form.reset()
		return false
	}
	// Action before request (has to return true to continue)
	if (options.before && typeof window[options.before] === 'function' && !window[options.before]()) return false
	// No parallel requests
	ODEAJAX.performing = true
	// Do request
	ODEAJAX.doActualAjax(options).then(response => {
		ODEAJAX.showResponse(response, options)
		if (typeof window[options.callback] === 'function') window[options.callback](response, options)
		if (options.scroll) options.scroll.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
	}).catch(xhr => {
		ODEAJAX.showError(xhr, options)
	})
}

// ————————————————————————————————————————————————————————————————————————————————
// Form sending
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.doForm = e => {
	// No default action
	e.preventDefault()
	// No parallel requests
	if (ODEAJAX.performing) return false
	// formAction
	if (e.submitter && e.submitter.hasAttribute('formaction')) e.delegateTarget.setAttribute('action', e.submitter.formAction)
	//
	ODEAJAX.doAjax(ODEAJAX.readOptions(e.delegateTarget))
}

// ————————————————————————————————————————————————————————————————————————————————
// Alerts
// require https://github.com/MLaritz/Vanilla-Notify
// alert = {title: "...", text: "...", function: "info|success|warning|error|notify"}
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.showAlerts = alerts => {
	Array.from(alerts).forEach(alert => { 
		vNotify[alert.function]({text: alert.text, title: alert.title, fadeInDuration: 10, position: vNotify.positionOption.bottomRight})
	})
}

// ————————————————————————————————————————————————————————————————————————————————
// Show loaded page
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.showResponse = (response, options) => {
	// HTML
	if (response.success) {
		if (response.html) {
			// Downloaded HTML-document
			var doc = new DOMParser().parseFromString(response.html, 'text/html')
			// Partial HTML-document
			if (options.target.id) {
				var el = doc.querySelector(options.target.id)
				if (el) {
					response.html = el.innerHTML
					doc = el
				}
			}
			// Insert HTML
			options.target.innerHTML = response.html
			// Execute JS
			doc.querySelectorAll('script').forEach(script => {
				if (script.src) loadJS(script.src, null, target)
				else 			eval(script.innerText)
			})
			// Document title
			if (options.history) document.title = response.title
		} else {
			var html = '<i class="fa fa-check fa-fw text-success animated bounceOutUp" aria-hidden="true"></i>'
			document.querySelector(options.target).innerHTML = html
		}
	}
	// Alerts
	if (response.alerts) ODEAJAX.showAlerts(response.alerts)
}

// ————————————————————————————————————————————————————————————————————————————————
// AJAX-request returned error
// ————————————————————————————————————————————————————————————————————————————————
ODEAJAX.showError = (xhr, options) => {
	// console.error(xhr.responseText ? xhr.responseText : xhr.statusText)
	var message = '<div class="alert alert-danger">' + (xhr.responseText ? xhr.responseText : xhr.statusText) + '</div>'
	options.target.innerHTML = message
}

// ————————————————————————————————————————————————————————————————————————————————
// History "initialization"
// ————————————————————————————————————————————————————————————————————————————————
history.replaceState({href: window.location.href}, null, window.location.href)

// ————————————————————————————————————————————————————————————————————————————————
// Actions after full page load
// Require docready.js from https://github.com/jfriend00/docReady
// ————————————————————————————————————————————————————————————————————————————————
docReady(() => {
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
				else if (target.dataset.close) ODEAJAX.doAjax({url: target.dataset.close})
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
				if (ODEAJAX.ajaxPerforming) return false
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
			e.delegateTarget = target.form
			ODEAJAX.doForm(e)
		}
	})
})

/**
 * Remake of Vanilla Notify from https://github.com/MLaritz/Vanilla-Notify
 * Uses Bootstrap 5 classes and functions
 * */

var vNotify = function() {
	// Positions for coniner
	const positions = {
		topLeft: 'topLeft',
		topRight: 'topRight',
		bottomLeft: 'bottomLeft',
		bottomRight: 'bottomRight',
		center: 'center'
	}
	// Display options 
	const options = {
		delay: 5000,			// Duration of display
		fadeInDuration: 100, 	// 
		fadeOutDuration: 300,	// 
		fadeInterval: 50,		// Opacity change step, ms
		position: positions.bottomRight,	// Default position
		postHoverDelay: 5000,	// Duration of display afet mouseout
		sticky: false,			// true => Do not autohide
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Different styles
	// 
	// text-bg-... — classes from Bootstrap 5.2, not supported at the moment of writing by
	// 	bootstrap-dark-5 — https://vinorodrigues.github.io/bootstrap-dark-5/
	// ————————————————————————————————————————————————————————————————————————————————
	var notify = function(a) { makeItem(a) }

	// var primary = function(a) { return a.notifyClass = 'text-bg-primary', makeItem(a) }
	// var secondary = function(a) { return a.notifyClass = 'text-bg-secondary', makeItem(a) }
	// var success = function(a) { return a.notifyClass = 'text-bg-success', makeItem(a) }
	// var danger = function(a) { return a.notifyClass = 'text-bg-danger', makeItem(a) }
	// var warning = function(a) { return a.notifyClass = 'text-bg-warning', makeItem(a) }
	// var info = function(a) { return a.notifyClass = 'text-bg-info', makeItem(a) }
	// var light = function(a) { return a.notifyClass = 'text-bg-light', makeItem(a) }
	// var dark = function(a) { return a.notifyClass = 'text-bg-dark', makeItem(a) }

	var primary = function(a) { return a.notifyClass = ['bg-primary', 'text-white'], makeItem(a) }
	var secondary = function(a) { return a.notifyClass = ['bg-secondary'], makeItem(a) }
	var success = function(a) { return a.notifyClass = ['bg-success', 'text-white'], makeItem(a) }
	var danger = function(a) { return a.notifyClass = ['bg-danger', 'text-white'], makeItem(a) }
	var warning = function(a) { return a.notifyClass = ['bg-warning'], makeItem(a) }
	var info = function(a) { return a.notifyClass = ['bg-info'], makeItem(a) }
	var light = function(a) { return a.notifyClass = ['bg-light'], makeItem(a) }
	var dark = function(a) { return a.notifyClass = ['bg-dark', 'text-white'], makeItem(a) }

	// Creation of a toast
	var makeItem = function(a) {
		if (!a.title && !a.text) return null
		var toast = document.createElement('div')
		toast.role = 'alert'
		toast.ariaLive = 'assertive'
		toast.ariaAtomic = true
		// toast.classList.add('toast', 'show', a.notifyClass) // Bootstrap 5.2
		toast.classList.add('toast', 'show', ...a.notifyClass)
		toast.style.opacity = 0 
		toast.options = setOptions(a)
		toast.addEventListener('hidden.bs.toast', () => {
			destroy(toast)
			destroyContainers()
		})

		if (a.title) { 
			toast.appendChild(makeTitle(a.title))
			a.text && toast.appendChild(makeBody(a.text))
		} else {
			toast.appendChild(makeBodyWithCloseBtn(a.text))
		}

		toast.delay = toast.dataset.bsDelay = toast.options.delay

		var setFadeOutInterval = function() {
			toast.fadeInterval = setOpacityInterval('out', toast.options.fadeOutDuration, toast)
		}
		var pauseOnHover = function() { 
			clearTimeout(toast.timeout)
			clearTimeout(toast.fadeInterval)
			toast.style.opacity = null
			toast.delay = toast.options.postHoverDelay
		}
		var setToastTimeout = function() {
			toast.timeout = setTimeout(setFadeOutInterval, toast.delay)
		}
		getContainer(toast.options.position).appendChild(toast)
		toast.addEventListener('mouseover', pauseOnHover)
		setOpacityInterval('in', toast.options.fadeInDuration, toast)
		// 
		if (!toast.options.sticky) {
			toast.addEventListener('mouseout', setToastTimeout)
			setToastTimeout()
		}
		return toast
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Body without a title
	// ————————————————————————————————————————————————————————————————————————————————
	var makeBodyWithCloseBtn = function(body) {
		var flex = document.createElement('div')
		flex.classList.add('d-flex')
		flex.appendChild(makeBody(body))
		flex.appendChild(makeCloseBtn())
		return flex
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Body, if a title is present
	// ————————————————————————————————————————————————————————————————————————————————
	var makeBody = function(body) {
		var div = document.createElement('div')
		div.classList.add('toast-body')
		div.innerText = body
		return div
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Toast title
	// ————————————————————————————————————————————————————————————————————————————————
	var makeTitle = function(title) { 
		var strong = document.createElement('strong')
		strong.classList.add('me-auto')
		strong.innerText = title
		var div = document.createElement('div') 
		div.classList.add('toast-header')
		div.appendChild(strong)
		div.appendChild(makeCloseBtn())
		return div
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Close button
	// ————————————————————————————————————————————————————————————————————————————————
	var makeCloseBtn = function() { 
		var close = document.createElement('button')
		close.type = 'button'
		close.classList.add('btn-close', 'me-2', 'm-auto')
		close.dataset.bsDismiss = 'toast'
		close.ariaLabel = 'Close'
		return close
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Container for toasts
	// ————————————————————————————————————————————————————————————————————————————————
	var getContainer = function(position) {
		var classes = getContainerPositionClasses(position)
		var container = document.querySelector('.' + classes.join('.'))
		return container ? container : makeContainer(classes)
	}

	var makeContainer = function(classes) { 
		var container = document.createElement('div')
		container.classList.add('toast-container', 'position-fixed', 'p-3', ...classes)
		document.body.appendChild(container) 
		return container 
	}

	var getContainerPositionClasses = function(position) {
		switch (position) {
			case positions.topLeft:
				return ['top-0', 'start-0']
			case positions.bottomRight:
				return ['bottom-0', 'end-0']
			case positions.bottomLeft:
				return ['bottom-0', 'start-0']
			case positions.center:
				return ['top-50', 'start-50', 'translate-middle']
			default:
				return ['top-0', 'end-0']
		}
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// 
	// ————————————————————————————————————————————————————————————————————————————————
	var setOptions = a => {
		return {
			delay: a.delay || options.delay,
			position: a.position || options.position,
			postHoverDelay: a.postHoverDelay || options.postHoverDelay,
			
			fadeInDuration: a.fadeInDuration || options.fadeInDuration,
			fadeOutDuration: a.fadeOutDuration || options.fadeOutDuration,
			fadeInterval: a.fadeInterval || options.fadeInterval,
			sticky: null != a.sticky ? a.sticky : options.sticky,
		}
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Destroy toast
	// ————————————————————————————————————————————————————————————————————————————————
	var destroy = el => {
		el.style.display = 'none'
		el.outerHTML = ''
		el = null
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// change = in|out
	// ————————————————————————————————————————————————————————————————————————————————
	var setOpacityInterval = function(change, fadeDuration, toast) {
		function changeOpacity() {
			opacity = change_in ? opacity + opacitystep : opacity - opacitystep
			toast.style.opacity = opacity
			opacity <= 0 && (destroy(toast), destroyContainers())
			if ((!change_in && opacity <= targetopacity) || (change_in && opacity >= targetopacity))
				window.clearInterval(interval_id)
		}
		var change_in = 'in' === change
		var opacity = change_in ? 0 : toast.style.opacity || 1
		var targetopacity = change_in ? .8 : 0
		var opacitystep = options.fadeInterval / fadeDuration
		change_in && (toast.style.display = 'block', toast.style.opacity = opacity)
		var interval_id = window.setInterval(changeOpacity, options.fadeInterval)
		return interval_id
	}

	// ————————————————————————————————————————————————————————————————————————————————
	// Destroy all toast containers oif there are no toasts
	// ————————————————————————————————————————————————————————————————————————————————
	var destroyContainers = function() {
		var anyToast = document.querySelector('.toast')
		if (!anyToast) document.querySelectorAll('.toast-container').forEach(el => destroy(el))
	}
	
	// ————————————————————————————————————————————————————————————————————————————————
	// 
	// ————————————————————————————————————————————————————————————————————————————————
	return {
		notify: notify,
		primary: primary,
		secondary: secondary,
		success: success,
		danger: danger,
		warning: warning,
		info: info,
		light: light,
		dark: dark,
		options: options,
		positionOption: positions
	}
}()

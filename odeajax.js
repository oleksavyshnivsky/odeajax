// Oleksa Vyshnivsky a.k.a. ODE
// dying.escape@gmail.com

// ————————————————————————————————————————————————————————————————————————————————
// Приклади використання
// 1) <a href="[...]" data-oa data-oa-target="#target;#main" data-oa-subresponse="#submain" data-oa-history data-oa-scroll="#target">[...]</a>
// 2) <form method="post" action="[...]" data-oa>[...]</form>
// 3) <form method="post" action="[...]" data-oa>[...]<a href="javascript:void(0)" data-oa-submit>[...]</a>[...]</form>
// 4) <form id="form-id" method="post" action="[...]" data-oa>[...]</form>[...] <a href="javascript:void(0)" data-oa-submit="#form-id">[...]</a>

// Атрибути
// data-oa — атрибут для посилань і форм, які мають оброблятися цим сценарієм
// data-oa-target — елемент, у який вивантажується результат. Якщо заданий список елементів (через ;), то результат вивантажується у перший з них, який наявний на сторінці. Якщо атрибут не заданий або пустий, результат вивантажується у main
// data-oa-subresponse — елемент відповіді сервера, який потрібно вивантажити. Якщо пусто — піставляється значення з data-oa-target. Якщо потрібного елементу у відповіді сервера нема, вивантажується повна відповідь сервера.
// - Неповне вивантаження відповіді сервера — це вивантаження #infobox + #id-потрібного-елементу.
// data-oa-history — якщо є, оновлювати історію браузера (якщо нема, але data-oa-target зводиться до main, то також оновлювати).
// data-oa-scroll — якщо є, прокручувати до елементу, в який вивантажено результат

// data-oa-submit — атрибут для a, input, select, які мають надсилати форму. Якщо елемент-надсилач знаходиться за межами форми, атрибут має мати значення — id цільової форми (data-oa-submit="#form-id").

// ————————————————————————————————————————————————————————————————————————————————

// Для блокування паралельних запитів
var ajaxPerforming = false

// Для уникнення аякс-завантаження сторінки відразу після традиційного
var just_loaded = true

// ————————————————————————————————————————————————————————————————————————————————
// Дії з URL
function getURLParameter(link, name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(link)||[,null])[1]
	)
}
function urlParse(link) {
	var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
	var parts = parse_url.exec(link)
	return parts
}
function urlBuild(parts) {
	return parts[1] + ':' + parts[2] + parts[3] 
		+ (parts[4] ? ':' + parts[4] : '') 
		+ (parts[5] ? '/' + parts[5] : '') 
		+ (parts[6] ? '?' + parts[6] : '') 
		+ (parts[7] ? '#' + parts[7] : '')
}
function addURLParameter(link, name, value) {
	link = removeURLParameter(link, name)
	var paramStr = name + "=" + encodeURIComponent(value)

	var parts = urlParse(link)
	if (parts[6]) parts[6] += '&'
	else parts[6] = ''
	parts[6] += paramStr
	
	return urlBuild(parts)
}
function removeURLParameter(link, name) {
	var r = new RegExp("&?"+name+"=([^&]$|[^&#]*)", 'i')
	return link.replace(r, '')
}

// ————————————————————————————————————————————————————————————————————————————————
// Прокрутка до потрібного елементу
function scrollToElement(target) {
	var el = document.querySelector(target)
	if (el) el.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
}

// 'Закривання' сторінки при аякс-переході
function blockScreen(target) {
	// var ajaxloader = $('#ajaxloader').clone().html()
	// $(target).css('position', 'relative')
	// $(target).append(ajaxloader)
}

function unblockScreen(target) {
	// $(target).find('.ajax-block').remove()
}

function uniqId() {
	return 'ode-el-' + Math.round(new Date().getTime() + (Math.random() * 100));
}


// ————————————————————————————————————————————————————————————————————————————————
// 
// ————————————————————————————————————————————————————————————————————————————————
const AJAX = options => {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest()
		xhr.open(options.method, options.url)
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
		xhr.onload = function() {
			if (xhr.status === 200) {
				try {
					resolve(JSON.parse(xhr.response))
				} catch (e) {
					reject(xhr.response)
				}
			} else {
				reject(xhr.status)
			}
		}
		xhr.send(options.data)
	})
}


// ————————————————————————————————————————————————————————————————————————————————
// Динамічне завантаження сценарію
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
function readOAOptions(element) {
	var options = {}
	// Запит підтвердження
	options.confirm = element.dataset.oaConfirm
	// Дія перед переходом
	options.before = element.dataset.oaBefore
	// id елементу, в який вивантажити результат
	options.target = element.dataset.oaTarget
	if (!options.target) {
		var tmp = element.closest('[data-oa-main]')
		if (tmp) {
			if (!tmp.id) tmp.id = uniqId()
			options.target = '#' + tmp.id
		}
		else
			options.target = '#main'
	}
	// Перевірка існування елементу
	var parts = options.target.split(';')
	if (parts.length > 1) {
		parts.every(t => {
			if (document.querySelector(t)) {
				options.target = t
				return false
			} else return true
		})
	}
	// Елемент відповіді, який потрібно показати
	options.subresponse = element.dataset.oaSubresponse
	// id елементу, до якого потрібно прокрутити сторінку
	options.scroll = null
	if (typeof element.dataset.oaScroll !== 'undefined') {
		options.scroll = element.dataset.oaScroll 
		if (!options.scroll) options.scroll = options.target
	}
	if (!options.scroll && options.target === '#main') options.scroll = options.target
	// Чи додавати сторінку в історію браузера
	options.history = options.target === '#main' ? true : (typeof element.dataset.oaHistory !== 'undefined')
	// Після виконання
	options.callback = element.dataset.oaCallback
	// Не блокувати цільовий елемент під час запису
	options.noblock =  typeof element.dataset.oaNoblock !== 'undefined'
	// Метод надсилання форми
	options.method = element.nodeName === 'FORM' ? element.getAttribute('method').toUpperCase() : 'GET'
	// Цільовий URL
	options.url = element.nodeName === 'FORM' ? element.getAttribute('action') : element.href
	if (element.nodeName === 'FORM' && !options.url) {
		options.url = options.method === 'POST' ? window.location.href : window.location.protocol + '//' + window.location.host + window.location.pathname
	}
	// Дані
	options.data = element.nodeName === 'FORM' ? new FormData(element) : null
	if (options.data && options.method === 'GET') options.url += (options.url.indexOf('?')>-1?'&':'?') + new URLSearchParams(options.data).toString()
	// Елемент, який потрібно оновити після закриття модального вікна
	options.parent = element.dataset.oaParent
	// Елемент, який надсилає запит
	options.source = element

	return options
}

// ————————————————————————————————————————————————————————————————————————————————
// Надсилання запиту
// ————————————————————————————————————————————————————————————————————————————————
function doAjax(options) {
	// Підтвердження
	if (options.confirm && !confirm(options.confirm)) return false
	// Дія перед переходом
	if (options.before && typeof window[options.before] === 'function' && !window[options.before]()) return false
	// Історія браузера
	options.url = new URL(options.url, window.location.href).toString()
	if (options.history && options.url !== window.location.href) history.pushState({'href': options.url}, '', options.url)
	// Блокування цільового елемента під час запиту
	if (!options.noblock) blockScreen(options.target)
	// Результат
	options.success = false
	// Надсилання запиту
	var settings = {
		method: options.method,
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	}
	if (options.data && options.method === 'POST') settings.body = options.data
	ajaxPerforming = true
	AJAX(options)
	// fetch(options.url, settings).then(response => {
	// 	return response.ok ? response.json() : Promise.reject(response)
	// })
	.then(response => {
		ajaxPerforming = false
		showAjaxPage(response, options)
		if (typeof window[options.callback] === 'function') window[options.callback](response, options)
	}).then(() => {
		if (options.scroll) scrollToElement(options.scroll)
		if (options.source) delete options.source.dataset.oaBlocked
	}).catch(err => {
		ajaxPerforming = false
		showAjaxError(err, options)
	})
}


// ————————————————————————————————————————————————————————————————————————————————
// Перехід за посиланням
// ————————————————————————————————————————————————————————————————————————————————


// ————————————————————————————————————————————————————————————————————————————————
// Надсилання форми
// ————————————————————————————————————————————————————————————————————————————————
function doAjaxForm(e) {
	// Заборона традиційного переходу
	e.preventDefault()
	// Заборона паралельних запитів
	if (ajaxPerforming || e.delegateTarget.dataset.oaBlocked) return false
	// formaction
	if (e.submitter && e.submitter.hasAttribute('formaction')) e.delegateTarget.setAttribute('action', e.submitter.formAction)
	// Надсилання форми
	doAjax(readOAOptions(e.delegateTarget))
}

// ————————————————————————————————————————————————————————————————————————————————
// Історія
// ————————————————————————————————————————————————————————————————————————————————
window.addEventListener('popstate', e => {
	// Перевірка на те, чи не відбулося тільки що традиційне завантаження сторінки
	if (just_loaded) return just_loaded = false
	// Перевірка на навігацію через "#"
	if (window.location.hash) return false
	// Надсилання запиту
	doAjax({
		method: 'GET',
		history: false,
		target: '#main',
		url: e.state.href,
	})
})

// ————————————————————————————————————————————————————————————————————————————————
// Показ завантаженої через Аякс сторінки
// ————————————————————————————————————————————————————————————————————————————————
function showAjaxPage(response, options) {
	// HTML
	if (response.success) {
		if (response.html) {
			// Показ сторінки
			var parser = new DOMParser()
			var doc = parser.parseFromString(response.html, 'text/html')
			if (options.subresponse && doc.querySelector(options.subresponse)) {
				response.html = doc.querySelector(options.subresponse).innerHTML
			} else if (doc.querySelector(options.target)) {
				response.html = doc.querySelector(options.target).innerHTML
			}
			var target = document.querySelector(options.target)
			target.innerHTML = response.html
			// URL
			target.dataset.oaSource = response.url
			// JS
			doc.querySelectorAll('script').forEach(script => {
				if (script.src) {
					loadJS(script.src, null, target)
				} else eval(script.innerText)
			})
			// Заголовок документу
			if (options.history || options.target == '#main') document.title = response.title
			// Оновлення історії переходів між сторінками
			if (options.history && response.url !== window.location.href) history.replaceState({'href': response.url}, '', response.url)
		} else {
			var html = '<i class="fa fa-check fa-fw text-success animated bounceOutUp" aria-hidden="true"></i>'
			document.querySelector(options.target).innerHTML = html
		}
	}
	// Alerts
	if (response.alerts) {
		Array.from(response.alerts).forEach(alert => { 
			vNotify[alert.function]({text: alert.text, title: alert.title, fadeInDuration: 10, position: vNotify.positionOption.bottomRight})
		})
	}
}

// ————————————————————————————————————————————————————————————————————————————————
// Помилка завантаження Аякс-сторінки
// ————————————————————————————————————————————————————————————————————————————————
function showAjaxError(err, options) {
	var message = '<div class="alert alert-danger">' + err + '</div>'
	var target = document.querySelector(options.target)
	if (target) target.innerHTML = message
}

// ————————————————————————————————————————————————————————————————————————————————
// Стартові дії
// ————————————————————————————————————————————————————————————————————————————————
history.replaceState({href: window.location.href}, null, window.location.href)
docReady(() => {
	just_loaded = false
	// Кліки
	document.addEventListener('click', e => {
		var path = e.path || (e.composedPath && e.composedPath())
		path.every(target => {
			if (target.nodeName === 'BODY' || target.nodeName === 'HTML') return false
			if (typeof target.dataset.close !== 'undefined') {
				// Закриття субсторінки
				var el = target.closest('[data-closable]')
				if (el) el.innerHTML = ''
				else if (target.dataset.close) doAjax({url: target.dataset.close, target: '#main', history: true})
				return false
			} else if (target.nodeName === 'A' && typeof target.dataset.oa !== 'undefined') {
				// Перехід за Ajax-посиланням
				e.delegateTarget = target
				// Пропуск натиску на середню кнопку миші, shift|alt|meta|ctrl + клік
				if (e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return true
				// Заборона традиційного переходу
				e.preventDefault()
				// Заборона паралельних запитів
				if (ajaxPerforming || e.delegateTarget.dataset.oaBlocked) return false
				// Основна функція
				doAjax(readOAOptions(e.delegateTarget))
				return false
			} else if (target.nodeName === 'A' && typeof target.dataset.oaSubmit !== 'undefined') {
				// Надсилання форми
				var form = target.dataset.oaSubmit ? document.querySelector(target.dataset.oaSubmit) : false
				if (!form) form = target.form ? target.form : target.closest('form')
				e.delegateTarget = form
				doAjaxForm(e)
				return false
			}
			return true
		})
	})


	// Надсилання форми через Аякс
	document.addEventListener('submit', e => {
		if (typeof e.target.dataset.oa !== 'undefined') {
			e.preventDefault()
			e.delegateTarget = e.target
			doAjaxForm(e)
		}
	})


	// Change
	document.addEventListener('change', e => {
		var path = e.path || (e.composedPath && e.composedPath())
		path.every(target => {
			if (target.nodeName === 'BODY') return false
			if ((target.nodeName === 'SELECT' || target.nodeName === 'INPUT') && typeof target.dataset.oaSubmit !== 'undefined') {
				// todo: input[data-oa-submit][type=checkbox]
				var form = target.dataset.oaSubmit ? document.querySelector(target.dataset.oaSubmit) : false
				if (!form) form = target.form ? target.form : target.closest('form')
				e.delegateTarget = form
				doAjaxForm(e)
				return false
			}
			return true
		})
	})
})

// key
const keyPool = {}

export function genKey() {
	const gen = () => Math.random().toString(16).substr(2, 12)
	let key = gen()
	while (keyPool.hasOwnProperty(key)) {
		key = gen()
	}
	keyPool[key] = true
	return key
}

// dom
export function element (tagName, className) {
	let el = document.createElement(tagName)
	if (className && className.trim()) {
		el.className = className
	}
	return el
}
export function qs (selector) {
	return document.querySelector(selector)
}
export function attr (el, name, value) {
	el.setAttribute(name, value)
}
export function addClass (el, name) {
	if (name && name.trim()) el.classList.add(name)
}
export function toggleClass (el, className) {
	el.classList.toggle(className)
}
export function remove (parent, selector){
	let el = selector
	if (typeof selector == 'string'){
		el = parent.querySelector(selector)
	}
	if (!selector instanceof Node) return
	if (el) parent.removeChild(el)
}
export const insertBefore = (target, el) => target.insertAdjacentElement('beforebegin', el)
export const insertAfter = (target, el) => target.insertAdjacentElement('afterend', el)

export function findUpAttr (el, attrName, thresholdClass = 'nib-editor') {
	while (el.parentNode) {
		el = el.parentNode
		if (el.hasAttribute(attrName)) return el
		else if (el.classList.contains(thresholdClass)) break
	}
	return null
}

export function findTextProgeny (el) {
	while (el.firstChild){
		el = el.firstChild
		if (el.nodeType == 3) return el
	}
	return null
}

// event
export function listen (target, event, callback) {
	target.addEventListener(event, callback)
}

export function clickOutside (target, callback) {
	listen(window, 'click', e => {
		if (!target.contains(e.target)) callback()
	})
}

export const emit = (target, event, data) => target.dispatchEvent(new CustomEvent(event, { detail: data }))

// text
export const textContent = (el) => {
	let text = ''
	if (el.childNodes){
		el.childNodes.forEach(i=>{
			if (i.getAttribute('contenteditable') != 'false' && i.dataset['pristine'] != 'true'){
				text+=i.textContent
			}
		})
	}
	return text
}

// selection & range
export const sel = () => window.getSelection()
export const setCaret = (node) => {
	let range = document.createRange(),
		sel = window.getSelection()
	range.selectNode(node)
	range.collapse()
	sel.removeAllRanges()
	sel.addRange(range)
}
export const locateCaret = () => {
	let sel = window.getSelection()
	let node = sel.anchorNode
	let offset = sel.anchorOffset
	return { node, offset }
}
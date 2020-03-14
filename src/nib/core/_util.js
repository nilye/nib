// key

export function addToKeyPool(key){
	if (typeof key == 'string') keyPool[key] = true
	if (Array.isArray(key)) key.forEach(k => keyPool[k] = true)
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

// event
export function listen (target, event, callback) {
	target.addEventListener(event, callback)
}

export function clickOutside (target, callback) {
	listen(window, 'click', e => {
		if (!target.contains(e.target)) callback()
	})
}

// text
// text content of a DOM element
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
export const setCaret = (node) => {
	let range = document.createRange(),
		sel = window.getSelection()
	range.selectNode(node)
	range.collapse()
	sel.removeAllRanges()
	sel.addRange(range)
}
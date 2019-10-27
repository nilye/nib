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
	const el = parent.querySelector(selector)
	if (el) parent.removeChild(el)
}
export const insertBefore = (target, el) => target.insertAdjacentElement('beforebegin', el)
export const insertAfter = (target, el) => target.insertAdjacentElement('afterend', el)

export function findUpAttr (el, attrName, thresholdClass = 'nib-editor') {
	while (el.parentNode) {
		el = el.parentNode
		if (el.hasAttribute(attrName)) {
			return el
		} else if (el.classList.contains(thresholdClass)) {
			break
		}
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
// export const svg = (str) => {
// 	let m = str.match(/^<[\w+,-]+/)[0], index
// 	if (m) {
// 		index = m.length
// 		return str.slice(0, index) + ` class="nib-icon"` + str.slice(index)
// 	} else {
// 		return str
// 	}
// }

// text
export const content = (el) => {
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
export const isCaretIn = (node) => {
	let sel = window.getSelection()
	if (sel && sel.rangeCount > 0) {
		let parent = locateCaret().node
		return node.contains(parent) || node == parent
	}
	return false
}
export const locateCaret = () => {
	let sel = window.getSelection()
	let node = sel.anchorNode
	let offset = sel.anchorOffset
	return { node, offset }
}
import Bold from '../format/bold'
import Italic from '../format/italic'
import Underline from '../format/underline'
import Strike from '../format/strike'
import { element } from './util'

class Formatter {
	constructor (formats){
		this.formats = {}
		this.formats[Bold.name] = Bold
		this.formats[Italic.name] = Italic
		this.formats[Underline.name] = Underline
		this.formats[Strike.name] = Strike
		if (formats){
			this.register(formats)
		}
		for (let k in this.formats) {
			this[k] = this.formats[k]
		}
	}

	toolbar () {
		let k = Object.keys(this.formats)
		return k.map((x)=>this.formats[x])
	}

	register (formats) {
		Object.assign(this.formats, formats)
	}

	render (node){
		if (!node.attr) {
			let span = element('span')
			span.innerText = el
			return span
		}
		let el = node.text
		for (let a in node.attr){
			if (this.formats.hasOwnProperty(a)){
				el = this.formats[a].render(el, node.attr[a])
			}
		}
		return el
	}

	selectedFragment(sel){
		const range = sel.sel.getRangeAt(0)
		let fragment = range.cloneContents()
		fragment.append(sel.startNode.cloneNode(true))
		fragment.append(sel.endNode.cloneNode(true))
		return fragment
	}

	contains (sel) {
		const fragment = this.selectedFragment(sel)
		// if any node contains
		let attr = {}
		for (let f in this.formats){
			if (this.formats.hasOwnProperty(f)) {
				const format = this.formats[f]
				attr[format.name] = format.isContained(fragment)
				if (attr[format.name]) attr.isDirty = true
			}
		}
		return attr
		// if all node contains
	}

	allContain (sel, formatName){
		const fragment = this.selectedFragment(sel)
		let textNodes = fragment.querySelectorAll('[data-nib-text="true"]')
		for (let el of textNodes){
			if (!this.formats[formatName].isContained(el)){
				return false
			}
		}
		return true
	}



/*<span data-nib-text="true" data-offset="9a2ffb39af48:0"><strong><em>rewqrewqrewqrewq</em></strong></span><span data-nib-text="true" data-offset="9a2ffb39af48:1">fdasfdsafd</span>*/
}

export default Formatter
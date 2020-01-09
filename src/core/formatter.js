import Bold from '../format/bold'
import Italic from '../format/italic'
import Underline from '../format/underline'
import Strike from '../format/strike'
import { element } from './util'

class Formatter {
	constructor (_default = true){
		this.formats = {}
		this.toolbar = {}
		if (_default){
			this.toolbar.basic = [Bold, Italic, Underline, Strike]
			for (let k of this.toolbar.basic) {
				this.formats[k.name] = k
			}
		}
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

	activeAttr (sel) {

	}

	allHas (sel, formatName){
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
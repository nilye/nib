import Bold from '../format/bold'
import Italic from '../format/italic'
import Underline from '../format/underline'
import Strike from '../format/strike'
import { element } from './util'
import Schema from '../model/schema'

class Formatter {
	constructor (_default = true){
		this.formats = {}
		this.formatsList = {}
		this.toolbar = {}
		if (_default){
			this.toolbar.basic = [Bold, Italic, Underline, Strike]
			for (let k of this.toolbar.basic) {
				this.formats[k.name] = k
			}
		}
		Object.keys(this.formats).forEach(a=>{
			this.formatsList[a] = true
		})
	}

	/**
	 * render a text node from json data
	 * @param {object} node - as `text` schema
	 * @returns {Element} - html element ready to append to DOM
	 */
	render (node){
		let el = node.text
		if (!node.attr) {
			let span = element('span')
			span.innerText = el
			return span
		}
		for (let a in node.attr){
			if (this.formats.hasOwnProperty(a)){
				el = this.formats[a].render(el, node.attr[a])
			}
		}
		return el
	}

	/**
	 * retrieve active attr
	 * @param storeVal - data store value
	 * @param sel - selection obj
	 * @returns {{thorough: {}, attr}}
	 */
	activeAttr(storeVal, sel){
		let inSel = false, // to mark if enter selected range
			currentBlkKey = '', attr = {},
			finished = false,
			consecutiveAttr = {
				bold: true,
				italic: true,
				underline: true,
				strike: true
			}
		function recurse (array){
			for (let i = 0; i < array.length; i++){
				let node = array[i]
				// if a text node
				if (Schema.isText(node)){
					let isAnchor, isFocus = currentBlkKey == sel.focus.key && i == sel.focus.node
					// start inSel
					if (!inSel && currentBlkKey == sel.anchor.key && i == sel.anchor.node){
						inSel = true
						isAnchor = true
					}
					// if selected text node contains no text, don't filter the active attributes
					const selectedEmptyContent =
						(isAnchor && sel.anchor.offset == node.text.length) ||
						(isFocus && (sel.focus.offset == 0) || !node.text)
					if (inSel && !selectedEmptyContent) {
						// filter active attr
						if (node.attr){
							attr = Object.assign(attr, node.attr)
							// filter consecutive attr
							for (let a in consecutiveAttr) {
								if (!node.attr.hasOwnProperty(a)) {
									delete consecutiveAttr[a]
								}
							}
						} else {
							// otherwise there is no consecutiveAttr
							consecutiveAttr = {}
						}
					}
					// end inSel
					if (isFocus){
						inSel = false
						finished = true
						break;
					}
				}
				// if a block node
				else if (Schema.isBlock(node)){
					currentBlkKey = node.key
					recurse(array[i].nodes)
					// get rip off unnecessary loop
					if (finished) return
				}
				if (finished) break
			}
		}
		recurse(storeVal)
		return {attr, thorough: consecutiveAttr}
	}

}

export default Formatter
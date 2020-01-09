import Bold from '../format/bold'
import Italic from '../format/italic'
import Underline from '../format/underline'
import Strike from '../format/strike'
import { element } from './util'
import { clone } from '../model/util'

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

	register (formats) {
		Object.assign(this.formats, formats)
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
	 * @param obj - data store value
	 * @param sel - selection obj
	 * @returns {{thorough: {}, attr}}
	 */
	activeAttr(obj, sel){
		let inSel = false, currentBlkKey = '', attr = {},
			finished = false,
			consecutiveAttr = {
				bold: true,
				italic: true,
				underline: true,
				strike: true
			}
		function recurse (array){
			for (let i = 0; i < array.length; i++){
				let item = array[i]
				// if a text node
				if (!item.nodes && item.kind == 'text'){
					// start inSel
					if (!inSel && currentBlkKey == sel.anchor.key && i == sel.anchor.node){
						inSel = true
					}
					//
					if (inSel) {
						if (item.attr){
							// filter active attr
							attr = Object.assign(attr, item.attr)
							// filter consecutive attr
							for (let a in consecutiveAttr) {
								if (!item.attr.hasOwnProperty(a)) {
									delete consecutiveAttr[a]
								}
							}
						} else {
							consecutiveAttr = {}
						}
					}
					// end inSel
					if (currentBlkKey == sel.focus.key && i == sel.focus.node){
						inSel = false
						finished = true
						break;
					}
				} else if (item.key && item.kind == 'block'){
					currentBlkKey = item.key
					recurse(array[i].nodes)
					// get rip off unnecessary loop
					if (finished) return
				}
				if (finished) break
			}
		}
		recurse(obj)
		return {attr, thorough: consecutiveAttr}
	}


/*<span data-nib-text="true" data-offset="9a2ffb39af48:0"><strong><em>rewqrewqrewqrewq</em></strong></span><span data-nib-text="true" data-offset="9a2ffb39af48:1">fdasfdsafd</span>*/
}

export default Formatter
import { element } from '../core/util'
import { clone } from '../model/util'

class Format {
	constructor (name, tagName, className){
		this.tagName = tagName
		this.className = className
		this.name = name
	}

	// set or modify text attribute in operator.js
	setAttr(data, value){
		let obj = clone(data)
		if (!!value) {
			if (!obj.attr) obj.attr = {}
			obj.attr[this.name] = value
		} else {
			if (!obj.attr) return obj
			if (obj.attr.hasOwnProperty(this.name)){
				delete obj.attr[this.name]
			}
			if (Object.keys(obj.attr).length === 0 ){
				delete obj.attr
			}
		}
		return obj
	}

	//
	render(node){
		let el = element(this.tagName, this.className)
		if (typeof node == 'string'){
			el.innerText = node
		} else if (node instanceof Node){
			el.append(node)
		}
		return el
	}


}

export default Format
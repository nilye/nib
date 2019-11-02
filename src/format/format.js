import { element } from '../core/util'

class Format {
	constructor (name, tagName, className){
		this.tagName = tagName
		this.className = className
		this.name = name
	}

	// modify text attr in Model data
	setAttr(obj, value){
		if (value) {
			if (!obj.attr) obj.attr = {}
			obj.attr[this.name] = value
		}
		else {
			delete obj.attr[this.name]
			if (Object.keys(obj.attr).length === 0 ){
				delete 	obj.attr
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

	// to check if a element contains a child of this Formation
	isContained(element){
		let selector = this.tagName
		if (this.className) selector += '.'+this.className
		const el = element.querySelector(selector)
		return Boolean(el)
	}

}

export default Format
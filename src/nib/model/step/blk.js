import { equal } from '../../core/utils'
import Path from '../../core/path'

const Blk = {

	/**
	 * set the value in a nested store
	 * @param obj
	 * @param {Array|String|Number} path - an array of access key/index for nested value
	 * @param {Object} value
	 * */
	set(obj, path, value){
		path = Path.normalize(path)
		if (path.length > 1){
			let k = path.shift()
			this.set(obj[k].nodes ? obj[k].nodes : obj[k], path, value)
		} else {
			obj[path[0]] = value
		}
	},

	/**
	 * get the value in a nested obj
	 * @param obj
	 * @param {Array|String|Number} path
	 * @returns {Object}
	 */
	get(obj, path){
		path = Path.normalize(path)
		if (path.length == 0) return obj
		if (path.length > 1){
			return path.reduce((child, k)=>{
				if (child && child.hasOwnProperty(k)){
					return  child[k].nodes ? child[k].nodes : child[k]
				}
				return child
			}, obj)
		} else {
			return obj[path[0]]
		}
	},

	/**
	 * delete the value in a nested obj
	 * @param obj
	 * @param {Array|String|Number} path
	 */
	remove(obj, path){
		path = Path.normalize(path)
		while (path.length > 1){
			obj = obj[path[0]].nodes
			if (!obj) return
			path.shift()
		}
		obj.splice(path[0], 1)
	},

	/**
	 * insert a new value into a certain place
	 * @param obj
	 * @param path
	 * @param value
	 */
	insert(obj, path, value){
		path = Path.normalize(path)
		const index = path.pop()
		obj = this.get(obj, path)
		obj.splice(index, 0, value)
	},

	/**
	 * find blk value in the store data by key
	 * @param {Array|Object} obj
	 * @param {String} key
	 * @return {Object} - {
	 *   blk - the blk object
	 *   indexes - the array of index to access this blk
	 * }
	 * */
	find(obj, key){
		let blkPath = []
		function recurse(array, key){
			for (let i = 0; i < array.length; i++){
				if (array[i].key == key){
					blkPath.unshift(i)
					return array[i]
				} else if (array[i].nodes){
					let blkVal = recurse(array[i].nodes, key)
					if (blkVal) {
						blkPath.unshift(i)
						return blkVal
					}
				}
			}
		}
		let blkVal = recurse(obj, key)
		return { blkVal, blkPath }
	},

	/**
	 * find mark (char index inside a blk)
	 * @param blkVal
	 * @param nodeIndex
	 * @param offset
	 * @returns {number}
	 */
	mark(blkVal, nodeIndex, offset) {
		let nodes = [], mark = 0
		if (blkVal.nodes && Array.isArray(blkVal.nodes)) nodes = blkVal.nodes
		for (let i = 0; i < nodes.length; i++){
			if (i < nodeIndex){
				mark += nodes[i].text.length
			} else if (i == nodeIndex) {
				mark += offset
				break
			}
		}
		return mark
	},

	/**
	 * reverse of mark()
	 * @param blkVal
	 * @param mark
	 * @param {boolean} isAnchor - affects on how to handle mark == len situation
	 * @returns {{offset: (*|number), nodeIndex: (*|number)}}
	 */
	locateMark(blkVal, mark, isAnchor = true){
		let nodes = [], nodeIndex, offset
		if (Array.isArray(blkVal)) nodes = blkVal
		if (blkVal.nodes && Array.isArray(blkVal.nodes)) nodes = blkVal.nodes
		for (let i = 0; i < nodes.length; i++){
			let item = nodes[i], len = item.text.length
			if (mark > len){
				mark -= len
			} else if (mark == len){
				if (isAnchor){
					// prevent it goes out of nodes length
					let isLast = i == nodes.length - 1
					nodeIndex = isLast ? i : i + 1
					offset = isLast ? len : 0
				} else {
					nodeIndex = i
					offset = len
				}
				break
			} else {
				nodeIndex = i
				offset = mark
				break
			}
		}
		if (nodeIndex === undefined || offset === undefined){
			// maybe the blkVal has no text content
			if (!this.textContent(blkVal)){
				nodeIndex = 0
				offset = 0
			} else {
				throw RangeError(`invalid mark value ${mark}`)
			}
		}
		return {key:blkVal.key, nodeIndex, offset, mark}
	},

	/**
	 * tidy block value -
	 * 1. merge nodes with same attribute
	 * 2. get rid of empty data
	 * @param blkVal
	 */
	tidy(blkVal){
		if (!blkVal.nodes || blkVal.nodes.length == 0) {
			blkVal.nodes = [Schema.text()]
			return blkVal
		}
		let lastItem = {attr: '_'}, lastIndex = 0
		for (let i = 0; i < blkVal.nodes.length; i++){
			let item = blkVal.nodes[i]
			if (!item.text && i > 0){
				item['remove'] = true
			}
			if (equal(item.attr, lastItem.attr)){
				lastItem.text += item.text
				blkVal.nodes[lastIndex] = lastItem
				item['remove'] = true
			} else {
				lastItem = item
				lastIndex = i
			}
		}
		// if doing splice while looping, the items are shifted therefore, it ends up skipping the iteration
		blkVal.nodes = blkVal.nodes.filter(item => !item.remove)
		return blkVal
	},

	/**
	 * get text content
	 * @param obj
	 * @returns {string|string}
	 */
	textContent(obj){
		let text = '', nodes = obj.nodes
		for (let i of nodes){
			text += i.text
		}
		return text
	},

	/**
	 * get text content length
	 * @param obj
	 * @returns {number}
	 */
	textLength(obj){
		return this.textContent(obj).length
	}
}

export default Blk
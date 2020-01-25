import { equal } from './util'

const Blk = {

	/**
	 * normalize path with string and number type into array
	 * @param {Number|String|Array} path
	 */
	normalizePath(path){
		if (typeof path == 'string') path = path.split('.')
		if (typeof path == 'number') path = [path]
		if (Array.isArray(path)) return path
	},

	/**
	 * set the value in a nested store
	 * @param obj
	 * @param {Array|String|Number} path - an array of access key/index for nested value
	 * @param {Object} value
	 * @param {boolean} skipNodes
	 * */
	set(obj, path, value, skipNodes = true){
		path = this.normalizePath(path)
		if (path.length > 1){
			let k = path.shift()
			this.set((skipNodes && obj[k].nodes) ? obj[k].nodes : obj[k], path, value)
		} else {
			obj[path[0]] = value
		}
	},

	/**
	 * get the value in a nested obj
	 * @param obj
	 * @param {Array|String|Number} path
	 * @param {boolean} skipNodes
	 * @returns {Object}
	 */
	get(obj, path, skipNodes = true){
		path = this.normalizePath(path)
		if (path.length == 0) return obj
		if (path.length > 1){
			return path.reduce((child, k)=>{
				if (child && child.hasOwnProperty(k)){
					return ( skipNodes && child[k].nodes) ? child[k].nodes : child[k]
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
		path = this.normalizePath(path)
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
	 * @param index
	 * @param value
	 */
	insert(obj, path, index, value){
		path = this.normalizePath(path)
		index = index || path.pop()
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
			}
			if (i == nodeIndex) {
				mark += offset
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
			}
			else if (mark == len){
				if (isAnchor){
					nodeIndex = i + 1
					offset = 0
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
		return {nodeIndex, offset}
	},

	/**
	 * tidy block value -
	 * 1. merge nodes with same attribute
	 * 2. get rid of empty data
	 * @param blkVal
	 */
	tidy(blkVal){
		if (!blkVal.nodes) return blkVal
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
	 * return text content
	 * @param obj
	 * @returns {string|string}
	 */
	textContent(obj){
		let text = '', nodes = obj.nodes
		for (let i of nodes){
			text += i.text
		}
		return text
	}

}

export default Blk
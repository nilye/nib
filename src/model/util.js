
/**
 * set the value in a nested obj
 * @param obj
 * @param {Array|String|Number} path - an array of access key/index for nested value
 * @param {Object} value
 * @param {boolean} skipNodes
 * */
export function setValue(obj, path, value, skipNodes = true){
	if (typeof path == 'string') path = path.split('.')
	if (typeof path == 'number') path = [path]
	if (path.length > 1){
		let k = path.shift()
		setValue((skipNodes && obj[k].nodes) ? obj[k].nodes : obj[k], path, value)
	} else {
		obj[path[0]] = value
	}
}

/**
 * get the value in a nested obj
 * @param obj
 * @param {Array|String|Number} path
 * @param {boolean} skipNodes
 * @returns {Object}
 */
export function getValue(obj, path, skipNodes = true){
	if (typeof path == 'string') path = path.split('.')
	if (typeof path == 'number') path = [path]
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
}

/**
 * delete the value in a nested obj
 * @param obj
 * @param {Array} path
 */
export function deleteValue(obj, path){
	if (typeof path == 'string') path = path.split('.')
	if (typeof path == 'number') path = [path]
	while (path.length > 1){
		obj = obj[path[0]].nodes
		if (!obj) return
		path.shift()
	}
	obj.splice(path[0], 1)
}

/**
 * a handy func for svelte component to get blk value from the store data
 * @param {Store} store
 * @param {*} path
 * @returns {*|Promise<NavigationPreloadState>|*}
 */
export function getStoreValue (store, path) {
	if (!path || path.length == 0){
		return store.getState()
	}
	return getValue(store.getState(), path)
}

/**
 * deep clone a obj recursively
 * @param {Array|Object} obj
 * @returns {Array|Object}
 */
export function clone(obj){
	let cloned = Array.isArray(obj) ? [] : {}
	Object.keys(obj).forEach(k=>{
		if (obj.hasOwnProperty(k)){
			let v = obj[k]
			cloned[k] = (v && typeof v === "object") ? clone(v) : v
		}
	})
	return cloned
}

/**
 * whether two objects are deeply equal
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 */
export function equal(a, b){
	if (!a && !b) return true
	if (!a || !b) return false
	let propA = Object.getOwnPropertyNames(a)
	let propB = Object.getOwnPropertyNames(b)
	if (propA.length != propB.length) return false
	for (let k in a){
		if (a.hasOwnProperty(k) && b.hasOwnProperty(k)){
			if (typeof a[k] === 'object' && typeof b[k] === 'object'){
				let isEq = equal(a[k], b[k])
				if (!isEq) return false
			}
			else if (a[k] !== b[k]) return false
		}
		else return false
	}
	return true
}

/**
 * find blk value in the store data by key
 * @param {Array|Object} obj
 * @param {String} key
 * @return {Object} - {
 *   blk - the blk object
 *   indexes - the array of index to access this blk
 * }
 * */
export function findBlk(obj, key){
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
}

/**
 * find mark (char index inside a blk)
 * @param blkVal
 * @param nodeIndex
 * @param offset
 * @returns {number}
 */
export function findMark(blkVal, nodeIndex, offset) {
	let nodes = [], mark = 0
	if (Array.isArray(blkVal)) nodes = blkVal
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
}

/**
 * reverse of findMark()
 * @param blkVal
 * @param mark
 * @param {boolean} isAnchor - affects on how to handle mark == len situation
 * @returns {{offset: (*|number), nodeIndex: (*|number)}}
 */
export function reverseMark(blkVal, mark, isAnchor = true){
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
}

/**
 *
 * @param blkVal
 * @param anchorMark
 * @param focusMark
 * @param value
 * @returns {*}
 */
export function replaceTextRange(blkVal, anchorMark, focusMark = -1, value = ''){
	let nodes = blkVal.nodes
	let anchor = reverseMark(blkVal, anchorMark, true),
		focus = reverseMark(blkVal, focusMark)
	console.log(anchor, focus)
	if (!nodes[anchor.nodeIndex]) return
	nodes[anchor.nodeIndex].text = nodes[anchor.nodeIndex].text.slice(0, anchor.offset)
	nodes[anchor.nodeIndex].text += value
	console.log(nodes)
	for (let i = anchor.nodeIndex; i < nodes.length; i++){
		if (i == focus.nodeIndex && focusMark >= 0){
			nodes[i].text = nodes[i].text.slice(focus.offset)
			break
		} else if (i != anchor.nodeIndex) {
			nodes.splice(i, 1)
		}
	}
	return blkVal
}

export function liftPath(path){

}

/**
 * tidy block value -
 * 1. merge nodes with same attribute
 * 2. get rid of empty data
 * @param blkVal
 */
export function tidyBlk(blkVal){
	if (!blkVal.nodes) return blkVal
	let lastItem = {attr: '_'}, lastIndex = 0
	for (let i = 0; i < blkVal.nodes.length; i++){
		let item = blkVal.nodes[i]
		if (!item.text || item.text.length == 0){
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
}

/**
 * flatten store value and return arrays of blk path and blk key
 * @param obj
 * @returns {{paths: Array, keys: Array}}
 */
export function flatten(obj){
	let paths = [], keys = []
	function recurse(obj, prefix = ''){
		for (let i = 0; i < obj.length; i++){
			const key = prefix + i, v = obj[i]
			keys.push(v.key)
			if (v.nodes && v.nodes.length > 0 && v.nodes[0].kind == 'block'){
				recurse(v.nodes, `${key}.`)
			} else {
				paths.push(key)
			}
		}
	}
	recurse(obj)
	return {paths, keys}
}

export function blkTextContent(obj){
	let text = '', nodes = obj.nodes
	for (let i of nodes){
		text += i.text
	}
	return text
}







// ! deprecated
/**
 * find start and end index of character, according to the nodes and offsets.
 * @param {object} blk
 * @param {number} startNode - index of starting node
 * @param {number} anchorOffset - offset in starting node
 * @param {number} endNode
 * @param {number} focusOffset
 * @returns {number[]|*[]}
 */
export function charIndex(blk, startNode, anchorOffset, endNode, focusOffset){
	if (!blk || !blk.nodes || blk.nodes.length == 0) return [0]
	let sum = 0, s, e,
		endLoop = endNode || startNode
	for (let i = 0; i < blk.nodes.length; i++){
		if (i == startNode){
			s = sum + anchorOffset
		}
		if (endNode != undefined && i == endNode){
			e = sum + focusOffset
		}
		if (i < endLoop){
			sum += blk.nodes[i].text.length
		} else break
	}
	return [s, e]
}

// ! deprecated
/**
 * reverse of charIndex(), find node and offset pair from character indexes
 * @param blk
 * @param index
 * @param {boolean} isStart - whether is start node
 * @returns {{node: (*|number), nodeDataOffset: string, offset: *}}
 */
export function locateNodes(blk, index, isStart = true){
	let node, offset
	// ds: delta start; de: delta end
	for (let i = 0; i < blk.nodes.length; i++){
		const nodeLength = blk.nodes[i].text.length,
			encompass = isStart ? nodeLength > index : nodeLength >= index
		if (node == undefined && encompass){
			node = i
			offset = index
		} else {
			index -= nodeLength
		}
	}
	return {
		node: node,
		offset: offset,
		key: blk.key,
		nodeDataOffset: blk.key + ':' + node
	}
}
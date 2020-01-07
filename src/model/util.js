
/**
 * set the value in a nested obj
 * @param obj
 * @param {Array|String|Number} keys - an array of access key/index for nested value
 * @param {Object} value
 * @param {boolean} skipNodes
 * */
export function setValue(obj, keys, value, skipNodes = true){
	if (typeof keys == 'string') keys = keys.split('.')
	if (typeof keys == 'number') keys = [keys]
	if (keys.length > 1){
		let k = keys.shift()
/*		if (!obj.hasOwnProperty(k) || typeof obj[k] !== 'object'){
			throw TypeError ('Out of layer:'+ obj)
		}*/
		setValue((skipNodes && obj[k].nodes) ? obj[k].nodes : obj[k], keys, value)
	} else {
		obj[keys[0]] = value
	}
}

/**
 * get the value in a nested obj
 * @param obj
 * @param {Array|String|Number} keys
 * @param {boolean} skipNodes
 * @returns {Object}
 */
export function getValue(obj, keys, skipNodes = true){
	if (typeof keys == 'string') keys = keys.split('.')
	if (typeof keys == 'number') keys = [keys]
	if (keys.length > 1){
		return keys.reduce((child, k)=>{
			if (child && child.hasOwnProperty(k)){
				return ( skipNodes && child[k].nodes) ? child[k].nodes : child[k]
			}
			return child
		}, obj)
	} else {
		return obj[keys[0]]
	}
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
			} else {
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
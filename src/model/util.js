/**
 * deep clone a obj recursively
 * @param {Array|Object} obj
 * @returns {Array|Object}
 */
import Schema from './schema'

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
			if (v.nodes.length > 0 && Schema.isBlock(v.nodes[0])){
				recurse(v.nodes, `${key}.`)
			} else {
				paths.push(key)
			}
		}
	}
	recurse(obj)
	return {paths, keys}
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
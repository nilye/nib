import { writable, get } from 'svelte/store';

/**
* set the value in a nested obj
* @param obj - data object
* @param {array} keys - an array of access key/index for nested value
* @param {any} value
* */
function setNestedValue(obj, keys, value){
	if (typeof keys == 'string') keys = keys.split('.')
	if (typeof keys == 'number') keys = [keys]
	if (keys.length > 1){
		let j = keys.shift()
		setNestedValue(obj[j], keys, value)
	} else {
		obj[keys[0]] = value
	}
}

/**
* find blk in the Model data by key
* @param {Array|Object} data
* @param {String} key
* @return {Object} - {
*   blk - the blk object
*   indexes - the array of index to access this blk
* }
* */
function findBlk(data, key){
	let indexes = []
	function recurse(array, key){
		for (let i = 0; i < array.length; i++){
			if (array[i].key == key){
				indexes.unshift(i)
				return array[i]
			} else {
				let blk = recurse(array[i].nodes, key)
				if (blk) {
					indexes.unshift(i)
					return blk
				}
			}
		}
	}
	let blk = recurse(data, key)
	return { blk, indexes }
}

/**
 * split a node data
 * @param {Object} node - node element
 * @param {number} start
 * @param {number} end
 * @returns {{nodes: Array, mIndex: number}} - {
 *   nodes: the array of new nodes
 *   mIndex: the index of the middle node
 * }
 */
function splitNode(node, start, end){
	let nodes = [], l = node.text.length,
		[s, m, e] = Array(3).fill(0).map(()=>Object.assign({}, node))
	if (start && start != 0 && start < l){
		s.text = node.text.substring(0, start)
		nodes.push(s)
	} else if (!start){
		start = 0
	}
	m.text = node.text.substring(start, end)
	nodes.push(m)
	if (end < l){
		e.text = node.text.substring(end)
		nodes.push(e)
	}
	let mIndex = nodes.indexOf(m)
	return {nodes, mIndex}
}

/**
 * @class Model
 * @param initial value
 */
class Model{
	constructor (initValue = []){
		this.store = writable(initValue)
		const { subscribe, update, set } = this.store
		this.subscribe = subscribe
		this.update = update
		this.set = set
	}

	data(){
		return get(this.store)
	}

	updateBlk(keys, value){
		this.update(v=>{
			console.log(v, value)
			// let u = JSON.parse(JSON.stringify(v));
			v[0] = value
			return Array(v)
		})
	}

	format(selection, formatter, value){
		if (selection.sameNode){
			const {blk, indexes} = findBlk(this.data(), selection.startKey)
			const {nodes, mIndex} = splitNode(
				blk.nodes[selection.startNodeOffset],
				selection.anchorOffset,
				selection.focusOffset
			)
			formatter.setAttr(nodes[mIndex], value)
			console.log(blk.nodes[selection.startNodeOffset],
				selection.anchorOffset,
				selection.focusOffset, {nodes, mIndex})
			this.update(v=>{
				blk.nodes.splice(selection.startNodeOffset, 1, ...nodes)
				setNestedValue(v, indexes, blk)
				return v
			})
		}
	}

}

export default Model

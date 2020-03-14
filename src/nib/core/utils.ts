import {Node} from './node'
import {Path} from "./path";
import {Text} from "./text";
import * as _ from 'lodash';
import {Root} from "./root";

/**
 * generate key
 */
const keyPool = {}
export function genKey(): string {
	const gen = () => Math.random().toString(32).substr(2, 8)
	let key = gen()
	while (keyPool.hasOwnProperty(key)) {
		key = gen()
	}
	keyPool[key] = true
	return key
}
/**
 * add keys to `keyPool`
 */
export function addToKeyPool(key: string | string[]): void{
	if (typeof key == 'string') keyPool[key] = true
	if (Array.isArray(key)) key.forEach(k => keyPool[k] = true)
}

/**
 * deep clone a obj recursively
 */
export function clone(obj: any): any{
	if (typeof obj !== 'object') return obj
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
 */
export function equal(a: any, b: any): boolean{
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
	// return isEqual(a, b)
}

export function isEmpty(obj: any): boolean{
	return _.isEmpty(obj)
}

/**
 * perform a deep iteration of item in a nested object or array via recursion
 * It takes a recursive function as second argument.
 */
export function deepEach(
	nodes: Root | Node | Node[] | Text[],
	func: (value: any, i?:number, deepPath?: Path) => any,
	path?: Path
): any{
	path = path || []
	if (!Array.isArray(nodes) && Node.isBranchNode(nodes)){
		nodes = nodes.nodes
	}
	for (let i = 0; i < (nodes as Node[]).length; i++){
		let value = nodes[i],
			deepPath = path.slice()
		deepPath.push(i)
	 	const result = func(value, i, deepPath)
		if (result !== undefined) return result
	}
}

export default {
	clone,
	equal,
	isEmpty,
	deepEach
}
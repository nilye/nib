

const a = [{
	key: 0,
	kind: 'block',
	type: 'p',
	nodes:[]
},{
	key: 1,
	kind: 'block',
	type: 'p',
	nodes:[
		{
			key: 2,
			kind: 'block',
			type: 'p',
			nodes:[
				{
					key: 3,
					kind: 'block',
					type: 'p',
					nodes:[
						{
							key: 4,
							kind: 'block',
							type: 'p',
							nodes:[
								{
									kind: 'text',
									text: '4 - 0'
								},{
									kind: 'text',
									text: '4 - 1'
								},{
									kind: 'text',
									text: '4 - 2'
								}
							]
						},{
							key: 5,
							kind: 'block',
							type: 'p',
							nodes:[
								{
									kind: 'text',
									text: '5 - 0'
								},{
									kind: 'text',
									text: '5 - 1'
								}
							]
						}
					]
				},{
					key: 6,
					kind: 'block',
					type: 'p',
					nodes:[
						{
							kind: 'text',
							text: '6 - 0'
						}
					]
				},{
					key: 7,
					kind: 'block',
					type: 'p',
					nodes:[
						{
							kind: 'text',
							text: '7 - 0'
						}
					]
				}
			]
		}
	]
},{
	key: 8,
	kind: 'block',
	type: 'p',
	nodes:[
		{
			kind: 'text',
			text: '8 - 0',
			attr:{
				bold: true
			}
		},{
			kind: 'text',
			text: '8 - 1',
			attr:{
				bold: true
			}
		}
	]
}]

let indexes = []
function findKey(array, key){
	for (let i = 0; i < array.length; i++){
		console.log(array[i], '\n', i)
		if (array[i].key == key){
			indexes.unshift(i)
			return array[i]
		} else {
			let blk = findKey(array[i].nodes, key)
			if (blk) {
				indexes.unshift(i)
				return blk
			}
		}
	}
}

function getValue(obj, keys, skipNodes = true){
	if (typeof keys == 'string') keys = keys.split('.')
	if (typeof keys == 'number') keys = [keys]
	return keys.reduce((child, k)=>{
		if (child && child.hasOwnProperty(k)){
			return ( skipNodes && keys.length > 1 && child[k].nodes) ? child[k].nodes : child[k]
		}
		return child
	}, obj)
}

function equal(a, b){
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

function activeAttr(obj, sel){
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
			console.log(item)
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

let sel = {
	anchor: {
		key: 4,
		node: 1
	},
	focus: {
		key: 5,
		node: 0
	}
}
console.log(activeAttr(a, sel))

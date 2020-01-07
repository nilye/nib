

const a = [{
	key: 0,
	kind: 'blk',
	type: 'p',
	nodes:[]
},{
	key: 1,
	kind: 'block',
	type: 'p',
	nodes:[
		{
			key: 2,
			kind: 'blk',
			type: 'p',
			nodes:[
				{
					key: 3,
					kind: 'blk',
					type: 'p',
					nodes:[
						{
							key: 4,
							kind: 'blk',
							type: 'p',
							nodes:[

							]
						},{
							key: 5,
							kind: 'blk',
							type: 'p',
							nodes:[

							]
						}
					]
				},{
					key: 6,
					kind: 'blk',
					type: 'p',
					nodes:[

					]
				},{
					key: 7,
					kind: 'blk',
					type: 'p',
					nodes:[]
				}
			]
		}
	]
},{
	key: 8,
	kind: 'block',
	type: 'p',
	nodes:[]
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

let x = {a:{b:1}, c:2, d:4}
let y = {a:{b:1}, d:4, c:2}

console.dir(equal(x, y))
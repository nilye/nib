const a = [{
	key: 0,
	kind: 'blk',
	type: 'p',
	nodes:[]
},{
	key: 1,
	kind: 'prime',
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
	kind: 'prime',
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

function find(){
	indexes = []
	return findKey(a, 5)
}
let x = find()
console.log(indexes, x)


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

function clone(obj){
	let cloned = Array.isArray(obj) ? [] : {}
	Object.keys(obj).forEach(k=>{
		if (obj.hasOwnProperty(k)){
			let v = obj[k]
			cloned[k] = (v && typeof v === "object") ? clone(v) : v
		}
	})
	return cloned
}

function replaceTextRange(blkVal, anchorMark, focusMark = -1, value = ''){
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

function splitNodes(blkVal, startMark, endMark){
	let nodes, head = [], body = [], tail = [], part = -1, outOfRange = false
	// if (Schema.isBlock(blkVal))
		nodes = blkVal.nodes
	// break into three parts if startPoint and endPoint both is passed
	if (!endMark || startMark >= endMark) endMark = undefined

	function push(newPart, node){
		part = newPart
		switch (part){
			case -1:
				head.push(node); break
			case 0:
				body.push(node); break
			case 1:
				tail.push(node); break
		}
	}

	for (let i = 0; i < blkVal.nodes.length; i++){
		let item = nodes[i],
			len = item.text.length

		console.log(startMark, endMark)
		if (startMark <= len -1 && startMark >= 0) {
			if (startMark == 0){
				push(0, item)
			} else {
				// head node
				let headNode = clone(item)
				headNode.text = item.text.slice(0, startMark)
				push(-1, headNode)
				// body node
				let bodyNode = clone(item)
				bodyNode.text = item.text.slice(startMark)
				// maybe endMark is also in same body node
				if (endMark > 0 && endMark < len - 1){
					let tailNode = clone(bodyNode)
					bodyNode.text = bodyNode.text.slice(0, endMark - startMark)
					push(0, bodyNode)
					// tail node
					tailNode.text = tailNode.text.slice(endMark - startMark)
					push(1, tailNode)
				} else {
					push(0, bodyNode)
				}
			}
		} else if (endMark && endMark >= 0 && endMark <= len -1){
			if (endMark == 0){
				push(1, item)
			} else {
				// body node
				let bodyNode = clone(item)
				bodyNode.text = item.text.slice(0, endMark)
				push(0, bodyNode)
				// tail node
				let tailNode = clone(item)
				tailNode.text = item.text.slice(endMark)
				push(1, tailNode)
			}
		} else {
			push(part, item)
		}
		startMark -= len
		if (endMark) endMark -= len

		console.log(head, body, tail)
	}

	if (body.length == 0) {
		outOfRange = true
	}
	return {head, body, tail, outOfRange}

}

let x = {
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
		},{
			kind: 'text',
			text: '4 - 3'
		}
	]
}

console.log(splitNodes(x, 10))
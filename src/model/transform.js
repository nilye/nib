import Blk from './blk'
import Schema from './schema'
import { clone } from './util'

const Transform = {

	/**
	 * split a blk nodes
	 * @param blkVal
	 * @param {Number} startMark
	 * @param {Number} endMark - break into three parts if startPoint and endPoint both is passed
	 * @returns {{head: Array, tail: Array, outOfRange: boolean, body: Array}}
	 */
	splitNodes(blkVal, startMark, endMark){
		let nodes, head = [], body = [], tail = [], part = -1, outOfRange = false
		if (Array.isArray(blkVal)) nodes = blkVal
		if (Schema.isBlock(blkVal)) nodes = blkVal.nodes

		// check endMark
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
			} else if (endMark >= 0 && endMark <= len -1){
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
		}
		if (body.length == 0) outOfRange = true
		return {head, body, tail, outOfRange}

	},


}

export default Transform
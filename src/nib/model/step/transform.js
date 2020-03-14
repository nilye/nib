import Blk from './blk'
import Schema from '../schema'
import { clone } from '../../core/utils'

const Transform = {

	/**
	 * split the nodes of a blk
	 * @param blkVal
	 * @param {Number} startMark
	 * @param {Number} endMark
	 * @desc This function can split blk into 3 pieces - head, body and tail, or into 2 pieces (both as selection start point or end point) with also same return value structure. Be aware, body is always the selected piece of the blk.
	 *  - what argument should parsed in each case ? -
	 * |case|                    | startMark | endMark |
	 * | 0  | split into 3 (2pt) |     *     |    *    |
	 * | 1  | split as start pt  |     *     |         |
	 * | 2  | split as end pt    |           |    *    |
	 * @returns {{head: Array, tail: Array, outOfRange: boolean, body: Array}}
	 */
	splitNodes(blkVal, startMark, endMark) {
		let nodes, head = [], body = [], tail = [],
			part = -1,
			outOfRange = false,
			_case = 0
		if (Schema.isBlock(blkVal)) nodes = clone(blkVal.nodes)

		/**
		 * identify each case
		 * - use `undefined` since 0 is also valid value
		 * - use `!=` because: null == undefined -> true
		 */
		if (startMark != undefined && endMark != undefined) {
			_case = 0
		} else if (startMark != undefined && endMark == undefined){
			_case = 1
		} else if ((startMark == undefined && endMark != undefined) || startMark >= endMark) {
			startMark = endMark
			endMark = undefined
			_case = 2
		}

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

		for (let i = 0; i < nodes.length; i++){
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
			}

			else if (endMark >= 0 && endMark <= len -1){
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

		// mapping return value
		if (body.length == 0) outOfRange = true
		if (_case == 2){
			return {head:[], body:head, tail:body, case:_case, outOfRange}
		}
		return {head, body, tail, case:_case, outOfRange}
	},

	/**
	 * merge nodes of two given block
	 * @param baseBlk - the other blk will merge to this blk
	 * @param targetBlk - merge nodes from this blk
	 * @returns {*} new block
	 */
	mergeNodes(baseBlk, targetBlk){
		let _baseBlk = clone(baseBlk)
		if (Schema.hasTextContent(baseBlk)){
			_baseBlk.nodes = _baseBlk.nodes.concat(targetBlk.nodes)
			Blk.tidy(_baseBlk)
			return _baseBlk
		}
		return clone(targetBlk)
	}




}

export default Transform
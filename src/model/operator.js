/**
 *
 * @param store
 * @param sel
 * @param formatter
 * @param value
 */
import { getValue, clone } from './util'
import { updateBlk } from './action'

export function formatSelection (store, sel, formatter, value) {
	let data = clone(store.getState())

	// same blk
	if (sel.anchor.key == sel.focus.key){
		const blkVal = getValue(data, sel.anchor.path)
		console.log(blkVal)
		let startMark = sel.anchor.mark,
			startNode = 0,
			startAttr = {}
		// split starting node
		for (let i = 0; i < blkVal.nodes.length; i++){
			let item = blkVal.nodes[i],
				len = item.text.length
			if (startMark > len - 1) startMark -= len // pass node
			else {
				// split node
				let nodes = [clone(item)]
				startAttr = nodes[0].attr
				// no split
				if (startMark == 0){
					nodes[0] = formatter.setAttr(nodes[0], value)
					startNode = i
				} else {
					// split node
					nodes[0].text = item.text.slice(0, startMark)
					nodes.push(clone(item))
					nodes[1].text = item.text.slice(startMark)
					nodes[1] = formatter.setAttr(nodes[1], value)
					startNode = i + 1
				}
				blkVal.nodes.splice(i, 1, ...nodes)
				break;
			}
		}
		// split ending node
		let endMark = sel.focus.mark - sel.anchor.mark
		for (let j = startNode; j < blkVal.nodes.length; j++){
			let item = blkVal.nodes[j],
				len = item.text.length
			if (endMark > len) {
				blkVal.nodes[j] = formatter.setAttr(item, value)
				endMark -= len
			}
			else {
				// split node
				let nodes = [clone(item)]
				nodes[0].text = item.text.slice(0, endMark)
				nodes[0] = formatter.setAttr(nodes[0], value)
				if (endMark < len - 1){
					nodes.push(clone(item))
					nodes[1].text = item.text.slice(endMark)
					// recover attr if ending node is also the starting node
					if (j == startNode){
						startAttr ? nodes[1].attr = startAttr : delete nodes[1].attr
					}
				}
				blkVal.nodes.splice(j, 1, ...nodes)
				break;
			}
		}
		console.log(blkVal)
		store.dispatch(updateBlk(sel.anchor.path, blkVal))
	}
}
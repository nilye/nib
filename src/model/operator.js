import { clone, flatten } from './util'
import { removeBlk, updateBlk } from './action'
import Blk from './blk'
import Transform from './transform'

/**
 * format data in selected range with passed formatter and value
 * @param store
 * @param sel
 * @param formatter
 * @param formatVal
 */
export function formatSelection(store, sel, formatter, formatVal){
	let data = store.getState(),
		startBlk, endBlk

	// format node fn
	function formatNode(blkVal, anchor, focus){
		let isStart = anchor ? true : focus && anchor,
			split = Transform.splitNodes(blkVal,
				isStart ? anchor.mark : focus.mark,
				isStart && focus ? focus.mark : undefined)
		if (isStart){
			split.body = split.body.map(i => formatter.setAttr(i, formatVal))
		} else {
			split.head = split.head.map(i => formatter.setAttr(i, formatVal))
		}
		blkVal.nodes = [...split.head, ...split.body, ...split.tail]
		Blk.tidy(blkVal)
	}

	// selection range is all in one blk
	if (sel.anchor.key == sel.focus.key){
		startBlk = Blk.get(data, sel.anchor.path)
		formatNode(startBlk, sel.anchor, sel.focus)
	}
	// selection range covers multiple blk
	else {
		startBlk = Blk.get(data, sel.anchor.path)
		endBlk = Blk.get(data, sel.focus.path)
		formatNode(startBlk, sel.anchor, null)
		formatNode(endBlk, null, sel.focus)

		// blks in-between
		let flatted = flatten(data),
			startPathIndex = flatted.paths.indexOf(sel.anchor.path.join('.')),
			endPathIndex = flatted.paths.indexOf(sel.focus.path.join('.'))
		let	pathInBetween = flatted.paths.slice(startPathIndex+1, endPathIndex)
		// loop between
		for (let i of pathInBetween){
			let path = i.split('.').map(Number),
				blkVal = Blk.get(data, path)
			blkVal.nodes = blkVal.nodes.map(i => formatter.setAttr(i, formatVal))
			Blk.tidy(blkVal)
			// update store
			store.dispatch(updateBlk(path, blkVal))
		}
	}
	// update store
	store.dispatch(updateBlk(sel.anchor.path, startBlk))
	if (endBlk){
		store.dispatch(updateBlk(sel.focus.path, endBlk))
	}
}


export function upperMerge(store, sel){
	const data = store.getState()
	if (!sel.prev) return
	const blkVal = Blk.get(data, sel.anchor.path),
		preBlkVal = Blk.get(data, sel.prev.path)
	preBlkVal.nodes = preBlkVal.nodes.concat(blkVal.nodes)
	Blk.tidy(preBlkVal)
	store.dispatch(updateBlk(sel.prev.path, preBlkVal))
	store.dispatch(removeBlk(sel.anchor.path))
}
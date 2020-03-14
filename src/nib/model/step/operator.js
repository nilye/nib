import { clone, flatten } from '../../core/utils'
import { insertBlk, removeBlk, updateBlk } from '../state/action'
import Blk from './blk'
import Transform from './transform'
import { genKey } from '../../core/util'
import Path from '../../core/path'

class Operator {

	constructor (store, selection){
		this.store = store
		this.selection = selection
	}

	/**
	 * format text nodes data in selected range with passed formatter and value
	 * @param formatter
	 * @param formatVal
	 * @param reSelect
	 */
	formatText(formatter, formatVal, options = {}){
		const { reSelect = true } = options
		let storeVal = this.store.value(),
			sel = this.selection.sel,
			startBlk, endBlk

		// format node fn
		function formatNode(blkVal, anchor, focus){
			let split = Transform.splitNodes(blkVal,
					anchor && anchor.mark,
					focus && focus.mark)
			split.body = split.body.map(i => formatter.setAttr(i, formatVal))
			blkVal.nodes = [...split.head, ...split.body, ...split.tail]
			Blk.tidy(blkVal)
		}

		// selection range is all in one blk
		if (sel.anchor.key == sel.focus.key){
			startBlk = Blk.get(storeVal, sel.anchor.path)
			formatNode(startBlk, sel.anchor, sel.focus)
		}
		// selection range covers multiple blk
		else {
			startBlk = Blk.get(storeVal, sel.anchor.path)
			endBlk = Blk.get(storeVal, sel.focus.path)
			formatNode(startBlk, sel.anchor)
			formatNode(endBlk, null, sel.focus)

			// blks in-between
			let flatted = flatten(storeVal),
				startPathIndex = flatted.paths.indexOf(Path.str(sel.anchor.path)),
				endPathIndex = flatted.paths.indexOf(Path.str(sel.focus.path))
			let	pathInBetween = flatted.paths.slice(startPathIndex+1, endPathIndex)
			// loop between
			for (let i of pathInBetween){
				let path = i.split('.').map(Number),
					blkVal = Blk.get(storeVal, path)
				blkVal.nodes = blkVal.nodes.map(i => formatter.setAttr(i, formatVal))
				Blk.tidy(blkVal)
				// update store
				this.store.dispatch(updateBlk(path, blkVal))
			}
		}
		// update store
		this.store.dispatch(updateBlk(sel.anchor.path, startBlk))
		if (endBlk){
			this.store.dispatch(updateBlk(sel.focus.path, endBlk))
		}
		// reselect
		if (reSelect){
			this.selection.reSelect()
		}
	}

	/**
	 * merge upward or downward a block into the another block of flat order
	 * @param path
	 * @param options - {
	 *   upward - `true` if upward, `false` if downward
	 * }
	 */
	mergeBlk(path, options = {}){
		const { upward = true, reSelect = true } = options
		let storeVal = this.store.value(),
			storePaths = this.store.paths(),
			pathIndex = storePaths.indexOf(Path.str(path)),
			blkVal = Blk.get(storeVal, path),
			baseBlk, targetBlk, basePath, targetPath, newBlk

		if (upward){
			if (pathIndex <= 0) return
			pathIndex--
		} else {
			if (pathIndex == storePaths.length - 1 ||
				pathIndex == -1) return
			pathIndex++
		}

		let _path = Path.normalize(storePaths[pathIndex]),
			_blkVal = Blk.get(storeVal, _path)
		baseBlk = upward ? _blkVal : blkVal
		targetBlk = upward ? blkVal : _blkVal
		basePath = upward ? _path : path
		targetPath = upward ? path : _path
		newBlk = Transform.mergeNodes(baseBlk, targetBlk)
		this.store.dispatch(updateBlk(basePath, newBlk))
		this.store.dispatch(removeBlk(targetPath))

		if (reSelect) {
			if (upward){
				this.selection.select({
					anchor:{
						key: _blkVal.key,
						path: _path,
						mark: Blk.textLength(baseBlk)
					}
				})
			} else {
				this.selection.reSelect()
			}
		}
	}

	splitBlk(path, mark, options = {}){
		const { reSelect = true } = options
		let storeVal = this.store.value(),
			blkVal = Blk.get(storeVal, path),
			splitBlk = clone(blkVal),
			splits = Transform.splitNodes(blkVal, mark)

		console.log(splits)
		blkVal.nodes = splits.head
		splitBlk.key = genKey()
		splitBlk.nodes = splits.body
		Blk.tidy(blkVal)
		Blk.tidy(splitBlk)

		const nextPath = Path.next(path)
		this.store.dispatch(updateBlk(path, blkVal))
		this.store.dispatch(insertBlk(nextPath, splitBlk))

		if (reSelect) {
			this.selection.select({
				anchor:{
					key: splitBlk.key,
					path: nextPath,
					mark: 0
				}
			})
	}
	}
}

export default Operator
















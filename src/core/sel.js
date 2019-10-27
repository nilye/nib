import { findUpAttr } from './dom'
import { genKey } from '../module/util'

class Sel {
	constructor (editor) {
		if (!editor || editor instanceof Node == false) {
			throw TypeError('editor is not a node ' + editor)
		} else {
			this.editor = editor
		}
		this.sel = {}
		this.eventPool = {}
		window.addEventListener('mouseup', e => this.onMouseup(e))
	}

	onMouseup (e) {
		let sel = window.getSelection()
		const isActive = this.editor.contains(document.activeElement) || this.editor == document.activeElement
		if ( isActive && sel.anchorNode && sel.rangeCount > 0) {
			let selData = {
				startNode: findUpAttr(sel.anchorNode, 'data-nib-text'),
				startBlk: findUpAttr(sel.anchorNode, 'data-nib-blk'),
				endNode: findUpAttr(sel.focusNode, 'data-nib-text'),
				endBlk: findUpAttr(sel.focusNode, 'data-nib-blk'),
			}
			// key
			if (selData.startBlk){
				selData['startKey'] = selData.startBlk.getAttribute('data-key')
				selData['endKey'] = selData.endBlk ? selData.endBlk.getAttribute('data-key') : selData.startKey
			}
			// node - text span
			if (selData.startNode) {
				const startNodeOffset = selData.startNode.getAttribute('data-offset')
				selData['startNodeOffset'] = startNodeOffset ? parseInt(startNodeOffset.split(':')[1]) : -1
			}
			if (selData.endNode) {
				const endNodeOffset = selData.endNode.getAttribute('data-offset')
				selData['endNodeOffset'] = endNodeOffset ? parseInt(endNodeOffset.split(':')[1]) : -1
			}
			// direction
			let backward = false
			if (!sel.isCollapsed) {
				let range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				backward = range.collapsed;
			}
			selData.backward = backward
			//
			selData['sameBlk'] = selData['startKey'] == selData['endKey']
			selData.focused = true
			selData.lastActiveKey =  this.sel.startKey == selData.startKey ? null : (this.sel.startKey || null)
			this.sel = Object.assign({}, {sel}, selData)
		} else {
			this.sel = Object.assign({}, {sel}, {
				focused: false,
				lastActiveKey: this.sel.startKey
			})
		}
		// on change callback fn
		let eventKeys = Object.keys(this.eventPool)
		if (eventKeys.length == 0) return
		eventKeys.forEach(id => {
			this.eventPool[id](this.sel)
		})
	}

	// assign on change callback fns
	onChange (cb) {
		this.eventPool[genKey()] = cb
	}
}

export default Sel
import { findTextProgeny, findUpAttr, genKey, qs } from './util'
import { findBlk } from '../model/util'

class Selection {
	constructor (editor, store) {
		if (!editor || editor instanceof Node == false) {
			throw TypeError('editor is not a node ' + editor)
		}
		this.editor = editor
		this.store = store
		this.sel = {
			anchor: {},
			focus: {},
			lastBlkKey:'',
			isCollapsed: true
		}
		this.eventPool = {}
		window.addEventListener('mouseup', e => {
			setTimeout(()=>{
				this.locate(e)
			}, 10)
		})
		window.addEventListener('keyup', e => this.locate())
	}

	// assign onChange callback fns
	onChange (cb) {
		this.eventPool[genKey()] = cb
	}
	// cast onChange callback fn
	dispatch (data){
		let eventKeys = Object.keys(this.eventPool)
		if (eventKeys.length == 0) return
		eventKeys.forEach(id => {
			this.eventPool[id](data)
		})
	}

	locate () {
		let sel = window.getSelection(),
			storeVal = this.store.getState()
		const isActive = this.editor.contains(document.activeElement) || this.editor == document.activeElement
		if ( isActive && sel.anchorNode && (sel.anchorNode.nodeType == 3 || sel.anchorNode.nodeName == 'INPUT')) {
			let selection = {}
			// direction
			let backward = false
			if (!sel.isCollapsed) {
				let range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				backward = range.collapsed;
			}
			// locate nodes
			const anchorNode = backward ? sel.focusNode : sel.anchorNode,
				focusNode = backward ? sel.anchorNode : sel.focusNode,
				anchorOffset = backward ? sel.focusOffset : sel.anchorOffset,
				focusOffset = backward ? sel.anchorOffset : sel.focusOffset,
				startNode = findUpAttr(anchorNode, 'data-nib-text'),
				startBlk = findUpAttr(anchorNode, 'data-nib-blk'),
				endNode = findUpAttr(focusNode, 'data-nib-text'),
				endBlk = findUpAttr(focusNode, 'data-nib-blk')
			let anchorNodeIndex = startNode.getAttribute('data-offset').split(':')[1],
				anchorKey = startBlk.getAttribute('data-key')
			selection['anchor'] = {
				key: anchorKey,
				path: findBlk(storeVal, anchorKey).blkPath,
				node: parseInt(anchorNodeIndex),
				offset: anchorOffset
			}
			let focusNodeIndex = endNode.getAttribute('data-offset').split(':')[1],
				focusKey = endBlk.getAttribute('data-key')
			selection['focus'] = {
				key: focusKey,
				path: findBlk(storeVal, focusKey).blkPath,
				node: parseInt(focusNodeIndex),
				offset: focusOffset
			}
			selection.isCollapsed = sel.isCollapsed
			selection.blurKey =  this.sel.anchor.key == selection.anchor.key ? null : (this.sel.anchor.key || null)
			this.sel = {...selection, sel}
			console.log(this.sel)
			this.dispatch(this.sel)
		} else {
			this.dispatch({
				blurKey: this.sel.anchor.key
			})
		}
	}

	reSelect(selection){
		if (!selection) selection = this.sel
		if (!this.sel) return
		let range = document.createRange(),
			sel = window.getSelection(),
			startTextNode = qs(`[data-offset="${selection.anchor.key + ':' +selection.anchor.node}"]`),
			endTextNode = qs(`[data-offset="${selection.focus.key + ':' +selection.focus.node}"]`)
		if (!startTextNode || !endTextNode) return
		startTextNode = findTextProgeny(startTextNode)
		endTextNode = findTextProgeny(endTextNode)
		range.setStart(startTextNode, selection.anchor.offset)
		range.setEnd(endTextNode, selection.focus.offset)
		sel.removeAllRanges()
		sel.addRange(range)
		this.locate()
	}
}

export default Selection
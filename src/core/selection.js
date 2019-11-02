import { findTextNode, findUpAttr, qs } from './util'
import { genKey } from './util'

class Selection {
	constructor (editor) {
		if (!editor || editor instanceof Node == false) {
			throw TypeError('editor is not a node ' + editor)
		}
		this.editor = editor
		this.sel = {}
		this.eventPool = {}
		window.addEventListener('mouseup', e => {
			setTimeout(()=>{
				this.onMouseup(e)
			}, 10)
		})
		window.addEventListener('keyup', e => this.onMouseup(e))
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

	onMouseup (e) {
		let sel = window.getSelection()
		const isActive = this.editor.contains(document.activeElement) || this.editor == document.activeElement
		if ( isActive && sel.anchorNode && (sel.anchorNode.nodeType == 3 || sel.anchorNode.nodeName == 'INPUT')) {
			let selData = {}
			// direction
			let backward = false
			if (!sel.isCollapsed) {
				let range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				backward = range.collapsed;
			}
			selData.backward = backward
			// locate nodes
			let anchorNode = backward ? sel.focusNode : sel.anchorNode
			let focusNode = backward ? sel.anchorNode : sel.focusNode
			let anchorOffset = backward ? sel.focusOffset : sel.anchorOffset
			let focusOffset = backward ? sel.anchorOffset : sel.focusOffset
			Object.assign(selData,{
				startNode: findUpAttr(anchorNode, 'data-nib-text'),
				startBlk: findUpAttr(anchorNode, 'data-nib-blk'),
				startPrime: findUpAttr(anchorNode, 'data-nib-prime'),
				endNode: findUpAttr(focusNode, 'data-nib-text'),
				endBlk: findUpAttr(focusNode, 'data-nib-blk'),
				endPrime: findUpAttr(focusNode, 'data-nib-prime'),
				anchorOffset,
				focusOffset
			})
			// key
			if (selData.startPrime){
				selData['startPrimeKey'] = selData.startPrime.getAttribute('data-key')
				selData['endPrimeKey'] = selData.endPrime ? selData.endPrime.getAttribute('data-key') : selData.startPrimeKey
			}
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
			//
			selData['sameNode'] = selData['startNode'] == selData['endNode']
			selData['sameBlk'] = selData['startKey'] == selData['endKey']
			selData['samePrime'] = selData['startPrimeKey'] == selData['endPrimeKey']
			selData.focused = true
			selData.isCollapsed = sel.isCollapsed
			selData.lastBlkKey =  this.sel.startKey == selData.startKey ? null : (this.sel.startKey || null)
			selData.lastPrimeKey =  this.sel.startPrimeKey == selData.startPrimeKey ? null : (this.sel.startPrimeKey || null)
			this.sel = {...selData, sel}
			// text selection
			this.lastTextSel = {
				startNode: selData.startNode,
				anchorOffset: sel.anchorOffset,
				endNode: selData.endNode,
				focusOffset: sel.focusOffset,
				backward
			}
			this.dispatch(this.sel)
		} else {
			this.dispatch({
				sel,
				focused: false,
				lastBlkKey: this.sel.startKey,
				lastPrimeKey: this.sel.startPrimeKey
			})
		}
	}

	reSelect(selObj){
		if (!selObj) selObj = this.lastTextSel
		console.log(this.lastTextSel)
		let range = document.createRange(),
			sel = window.getSelection(),
			startTextNode = qs(`[data-offset="${selObj.startNode.dataset.offset}"]`),
			start = [findTextNode(startTextNode), selObj.anchorOffset],
			endTextNode = qs(`[data-offset="${selObj.endNode.dataset.offset}"]`),
			end = [findTextNode(endTextNode), selObj.focusOffset]
		range.setStart(start[0], start[1])
		range.setEnd(end[0], end[1])
		if (selObj.backward){
			range.setStart(end[0], end[1])
			range.setEnd(start[0], start[1])
		}
		sel.removeAllRanges()
		sel.addRange(range)
		this.dispatch(this.sel)
	}
}

export default Selection
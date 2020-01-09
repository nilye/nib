import { genKey, qs } from './util'
import { getValue, findBlk, findMark, reverseMark } from '../model/util'

function findUpAttr (el, attrName, thresholdClass = 'nib-editor') {
	while (el.parentNode) {
		el = el.parentNode
		if (el.hasAttribute(attrName)) return el
		else if (el.classList.contains(thresholdClass)) break
	}
	return null
}

function findTextProgeny (el) {
	while (el.firstChild){
		el = el.firstChild
		if (el.nodeType == 3) return el
	}
	return null
}

class Selection {
	constructor (editor, store) {
		if (!editor || editor instanceof Node === false) {
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
			let anchorNodeIndex = parseInt(startNode.getAttribute('data-offset').split(':')[1]),
				anchorKey = startBlk.getAttribute('data-key'),
				anchorBlk = findBlk(storeVal, anchorKey)
			//
			let focusNodeIndex = parseInt(endNode.getAttribute('data-offset').split(':')[1]),
				focusKey = endBlk.getAttribute('data-key'),
				focusBlk = findBlk(storeVal, focusKey)
			/*
			* assign selection var
			* -- Terminology --
				 anchor: starting point
				 focus: ending point
				 key: key of blk
				 path: path of blk access keys in store
				 node: text node index in blk
				 offset: char index in a text node
				 mark: overall char index in a blk
			* */
			selection['anchor'] = {
				key: anchorKey,
				path: anchorBlk.blkPath,
				node: anchorNodeIndex,
				offset: anchorOffset,
				mark: findMark(anchorBlk.blkVal, anchorNodeIndex, anchorOffset)
			}
			selection['focus'] = {
				key: focusKey,
				path: focusBlk.blkPath,
				node: focusNodeIndex,
				offset: focusOffset,
				mark: findMark(focusBlk.blkVal, focusNodeIndex, focusOffset)
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

	select (selection) {
		let range = document.createRange(),
			sel = window.getSelection(),
			storeVal = this.store.getState(),
			anchorBlkVal = selection.anchor.path ? getValue(storeVal, selection.anchor.path) : findBlk(storeVal, selection.anchor.key).blkVal,
			focusBlkVal
		if (selection.anchor.key == selection.focus.key){
			focusBlkVal = anchorBlkVal
		} else {
			focusBlkVal = selection.focus.path ? getValue(storeVal, selection.focus.path) : findBlk(storeVal, selection.focus.key).blkVal
		}
		// locate nodeIndex and offset
		let anchor = reverseMark(anchorBlkVal, selection.anchor.mark, true),
			focus = reverseMark(focusBlkVal, selection.focus.mark, false)
		// query select elements
		let startTextNode = qs(`[data-offset="${selection.anchor.key + ':' + anchor.nodeIndex}"]`),
			endTextNode = qs(`[data-offset="${selection.focus.key + ':' + focus.nodeIndex}"]`)
		if (!startTextNode || !endTextNode) return
		startTextNode = findTextProgeny(startTextNode)
		endTextNode = findTextProgeny(endTextNode)
		range.setStart(startTextNode, anchor.offset)
		range.setEnd(endTextNode, focus.offset)
		sel.removeAllRanges()
		sel.addRange(range)
		this.locate()
	}

	reSelect(selection){
		if (!selection) selection = this.sel
		if (!this.sel) return
		this.select(selection)
	}
}

export default Selection
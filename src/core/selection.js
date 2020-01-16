import { genKey, qs } from './util'
import { getValue, findBlk, findMark, reverseMark, flatten } from '../model/util'

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
		const isActive = this.editor.contains(sel.anchorNode) || this.editor == document.activeElement
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
			let anchorNodeIndex = startNode.getAttribute('data-offset') ? parseInt(startNode.getAttribute('data-offset').split(':')[1]) : 0,
				anchorKey = startBlk.getAttribute('data-key'),
				anchorBlk = findBlk(storeVal, anchorKey)
			//
			let focusNodeIndex = startNode.getAttribute('data-offset') ? parseInt(endNode.getAttribute('data-offset').split(':')[1]) : 0,
				focusKey = endBlk.getAttribute('data-key'),
				focusBlk = findBlk(storeVal, focusKey)
			/*
			* get anchor and focus
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
			// get in between
			let flatted = flatten(storeVal)
			let fkAnchor = flatted.keys.indexOf(anchorKey),
				fkFocus = flatted.keys.indexOf(focusKey),
				fpAnchor = flatted.paths.indexOf(anchorBlk.blkPath.join('.')),
				fpFocus = flatted.paths.indexOf(focusBlk.blkPath.join('.'))
			selection.between = {
				keys: flatted.keys.slice(fkAnchor, fkFocus+1),
				paths: flatted.paths.slice(fpAnchor, fpFocus+1).join('.')
			}
			// previous or next blk
			if (flatted.paths[fkAnchor - 1]){
				selection.prev = {
					path: flatted.paths[fkAnchor - 1].split('.').map(n=>parseInt(n)),
					key: flatted.keys[fkAnchor - 1]
				}
			}
			selection.isCollapsed = sel.isCollapsed
			selection.blurKey =  this.sel.anchor.key == selection.anchor.key ? null : (this.sel.anchor.key || null)
			selection.focused = true
			this.sel = {...selection, sel}
			this.dispatch(this.sel)
		} else {
			this.dispatch({
				focused: false,
				blurKey: this.sel.anchor.key
			})
		}
	}

	select (sel) {
		let range = document.createRange(),
			windowSel = window.getSelection(),
			storeVal = this.store.getState(),
			anchorBlkVal = sel.anchor.path ? getValue(storeVal, sel.anchor.path) : findBlk(storeVal, sel.anchor.key).blkVal,
			focusBlkVal
		if (!sel.focus) sel.focus = sel.anchor
		if (sel.anchor.key == sel.focus.key){
			focusBlkVal = anchorBlkVal
		} else {
			focusBlkVal = sel.focus.path ? getValue(storeVal, sel.focus.path) : findBlk(storeVal, sel.focus.key).blkVal
		}
		// locate nodeIndex and offset
		let anchor = reverseMark(anchorBlkVal, sel.anchor.mark, true),
			focus = reverseMark(focusBlkVal, sel.focus.mark, false)
		// query select elements
		let startTextNode = qs(`[data-offset="${sel.anchor.key + ':' + anchor.nodeIndex}"]`),
			endTextNode = qs(`[data-offset="${sel.focus.key + ':' + focus.nodeIndex}"]`)
		if (!startTextNode || !endTextNode) return
		startTextNode = findTextProgeny(startTextNode)
		endTextNode = findTextProgeny(endTextNode)
		range.setStart(startTextNode, anchor.offset)
		range.setEnd(endTextNode, focus.offset)
		windowSel.removeAllRanges()
		windowSel.addRange(range)
		this.locate()
	}

	reSelect(sel){
		if (!sel) sel = this.sel
		if (!this.sel) return
		this.select(sel)
	}
}

export default Selection
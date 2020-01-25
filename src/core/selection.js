import { genKey, qs } from './util'
import Blk from '../model/blk'
import { tick } from 'svelte'

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
			blurKey:'',
			isCollapsed: true,
			focused: true
		}
		this.eventPool = {}
		window.addEventListener('mouseup', e => {
			setTimeout(()=>{
				this.locate(e)
			}, 10)
		})
		window.addEventListener('keyup', e => this.locate())
	}

	// assign onChange callback fn
	onChange (cb) {
		this.eventPool[genKey()] = cb
	}
	// cast onChange callback fn
	dispatch (data){
		console.log(data)
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
				startNode = this.findUpAttr(anchorNode, 'data-nib-text'),
				endNode = this.findUpAttr(focusNode, 'data-nib-text')
			// get point info
			let anchorNodeIndex = parseInt(startNode.dataset.index) || 0,
				anchorKey = startNode.dataset.key,
				anchorBlk = Blk.find(storeVal, anchorKey)
			let focusNodeIndex = parseInt(endNode.dataset.index) || 0,
				focusKey = endNode.dataset.key,
				focusBlk = Blk.find(storeVal, focusKey)
			/*
			* get anchor and focus
			* -- Terminology --
				 point: start or end of a selection
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
				mark: Blk.mark(anchorBlk.blkVal, anchorNodeIndex, anchorOffset)
			}
			selection['focus'] = {
				key: focusKey,
				path: focusBlk.blkPath,
				node: focusNodeIndex,
				offset: focusOffset,
				mark: Blk.mark(focusBlk.blkVal, focusNodeIndex, focusOffset)
			}
/*			// get in between
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
			}*/
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

	async select (sel) {
		// Wait till any pending state changes have been applied and render to DOM by svelte!
		await tick()
		//
		let storeVal = this.store.getState()
		// get blk value
		let anchorBlkVal = sel.anchor.path ? Blk.get(storeVal, sel.anchor.path) : Blk.find(storeVal, sel.anchor.key).blkVal,
			focusBlkVal
		if (!sel.focus) sel.focus = sel.anchor
		if (sel.anchor.key == sel.focus.key){
			focusBlkVal = anchorBlkVal
		} else {
			focusBlkVal = sel.focus.path ? Blk.get(storeVal, sel.focus.path) : Blk.find(storeVal, sel.focus.key).blkVal
		}
		// locate nodeIndex and offset
		let anchor = Blk.locateMark(anchorBlkVal, sel.anchor.mark, true),
			focus = Blk.locateMark(focusBlkVal, sel.focus.mark, false)
		// query select elements
		let startTextNode = qs(`[data-key='${sel.anchor.key}'][data-index='${anchor.nodeIndex}']`),
			endTextNode = qs(`[data-key='${sel.focus.key}'][data-index='${focus.nodeIndex}']`)
		if (!startTextNode || !endTextNode) return
		// find text progeny element
		startTextNode = this.findTextProgeny(startTextNode)
		endTextNode = this.findTextProgeny(endTextNode)
		// set range and add to window selection
		let range = document.createRange(),
			windowSel = window.getSelection()
		range.setStart(startTextNode, anchor.offset)
		range.setEnd(endTextNode, focus.offset)
		windowSel.removeAllRanges()
		windowSel.addRange(range)
		// update selection
		this.locate()
	}

	reSelect(sel){
		if (!sel) sel = this.sel
		if (!this.sel) return
		this.select(sel)
	}

	// utils

	/**
	 * return the parent node element which has certain attribute name
	 * @param {Element|Node} el
	 * @param attrName
	 * @param thresholdClass
	 * @returns {(Node|Element|null}
	 */
	findUpAttr (el, attrName, thresholdClass = 'nib-editor') {
		while (el.parentNode) {
			el = el.parentNode
			if (el.hasAttribute(attrName)) return el
			else if (el.classList.contains(thresholdClass)) break
		}
		return null
	}

	/**
	 * find the closet text element progeny
	 * @param el
	 * @returns {Node|null}
	 */
	findTextProgeny (el) {
		while (el.firstChild){
			el = el.firstChild
			if (el.nodeType == 3) return el
		}
		return null
	}

}

export default Selection
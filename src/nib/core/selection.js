import { genKey, qs } from './utils'
import Blk from '../model/step/blk'
import { tick } from 'svelte'
import Path from './path'

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
		const sel = window.getSelection(),
			fromEditor = this.editor.contains(sel.anchorNode) || this.editor == document.activeElement

		if ( fromEditor && sel.anchorNode &&
			(sel.anchorNode.nodeType == 3 ||
				sel.anchorNode.nodeName == 'INPUT')
		){

			// assign value
			let anchorNode = sel.anchorNode,
				focusNode = sel.focusNode,
				anchorOffset = sel.anchorOffset,
				focusOffset = sel.focusOffset
			let selection = {}

			// direction
			let backward = false
			if (!sel.isCollapsed) {
				let range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				backward = range.collapsed;
			}
			if (backward){
				anchorNode = [focusNode, focusNode = anchorNode][0]
				anchorOffset = [focusOffset, focusOffset = anchorOffset][0]
			}

			// locate nodes
			const anchorEl = this.findAncestors(anchorNode),
				focusEl = this.findAncestors(focusNode)

			// check if it is the very end or first offset


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
				sec: anchorEl.sec.dataset.key,
				key: anchorEl.txt.dataset.key,
				path: Path.normalize(anchorEl.blk.dataset.path),
				node: parseInt(anchorEl.txt.dataset.index) || 0,
				offset: anchorOffset,
				mark: this.getMark(anchorEl.blk, anchorNode, anchorOffset)
			}
			selection['focus'] = {
				sec: focusEl.sec.dataset.key,
				key: focusEl.txt.dataset.key,
				path: Path.normalize(focusEl.blk.dataset.path),
				node: parseInt(focusEl.txt.dataset.index) || 0,
				offset: focusOffset,
				mark: this.getMark(focusEl.blk, focusNode, focusOffset)
			}

			// mapping return value
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

	/**
	 * select the text of given range
	 * @param sel - if only anchor is passed, select as collapsed caret
	 * @returns {Promise<void>}
	 */
	async select (sel) {
		// Wait till any pending state changes have been applied and rendered to DOM by svelte!
		await tick()
		// get blk value
		let storeVal = this.store.value(),
			anchorBlkVal = sel.anchor.path ? Blk.get(storeVal, sel.anchor.path) : Blk.find(storeVal, sel.anchor.key).blkVal,
			focusBlkVal
		//
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
		this.select(sel).then()
	}

	// utils

	/**
	 * get mark (text offset) relative to text node's parent container
	 * @param blkNode
	 * @param textNode
	 * @param offset
	 * @returns {number}
	 */
	getMark(blkNode, textNode, offset){
		let range = document.createRange()
		range.selectNodeContents(blkNode)
		range.setEnd(textNode, offset)
		return range.toString().length
	}

	/**
	 * return text, block and section ancestor of a text node
	 * @param el
	 * @param thresholdClass
	 * @returns {{blk: *, sec: *, txt: *}}
	 */
	findAncestors (el, thresholdClass = 'nib-editor') {
		if (el.nodeType !== 3) throw Error(`'el' must be a text element!`)
		let txt, blk, sec
		while (el.parentNode) {
			el = el.parentNode
			if (el.hasAttribute('data-nib-txt')) txt = el
			if (el.hasAttribute('data-nib-blk')) blk = el
			if (el.hasAttribute('data-nib-sec')) {
				sec = el; break
			}
			if (el.classList.contains(thresholdClass)) break
		}
		return {txt, blk, sec}
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
import { addClass, append, attr, clickOutside, element, emit, isCaretIn, listen, toggleClass } from './dom'
import { createInsertion, genKey } from '../module/util'
import chevronDown from '../assets/icon/chevron-down.svg'
import trash from '../assets/icon/trash.svg'

class Blk {
	constructor (editor, type, tagName, className, data) {
		this.tagName = tagName
		this.className = className
		this.type = type
		this.data = data
		this.key = genKey()
		this.editor = editor
		this.firstBlk = false
	}

	createNode () {
		// element
		let el, ctrl, ctt, menu
		el = element('div', 'nib-blk')
		// controls
		ctrl = element('div', 'nib-blk-ctrl')
		menu = this.createMenu()
		ctrl.innerHTML = `
			<div class="nib-blk-handle"></div>
			<div>
				<div class="nib-icon-btn outline">
					${chevronDown}
				</div>
			</div>
		`
		let btn = ctrl.querySelector('.nib-icon-btn')
		listen(btn, 'click', ()=>{
			toggleClass(menu, '_active')
		})
		clickOutside([menu,btn], ()=> {
			console.log('___')
			if (menu.classList.contains('_active')){
				menu.classList.remove('_active')
			}
		})
		append(ctrl, menu)
		attr(ctrl, 'contenteditable', false)
		// content
		ctt = element('div', 'nib-blk-content')
		attr(ctt, 'style', 'white-space: pre-line')
		append(ctt, this.createBlk())
		// insertion
		createInsertion(el, () => {this.insertBlk('before')})
		append(el, ctrl)
		append(el, ctt)
		this.element = el
		this.bindEvents()
		this.bindFirstBlk()
		return el
	}

	createBlk () {
		let blk
		// block
		blk = element(this.tagName, this.className)
		attr(blk, 'data-key', this.key)
		attr(blk, 'style', 'position:relative')
		// span
		this.isEmpty = true
		this.blk = blk
		return blk
	}

	createMenu () {
		let menu
		menu = element('div', 'nib-menu')
		menu.innerHTML = `
			<div class="nib-menu-divider"></div>
			<div class="nib-menu-tile">
				${trash}
				<div>Delete</div>
			</div>
		`
		return menu
	}

	bindFirstBlk(){}

	bindEvents () {
		listen(this.blk, 'click', e => this.click(e))
		listen(window, 'keydown', e => {
			if (isCaretIn(this.blk)) this.keydown(e)
		})
		listen(window, 'keyup', e => {
			if (isCaretIn(this.blk)) this.keyup(e)
		})
		// click outside
		clickOutside(this.blk, ()=>this.clickOutside())
		// editor input
		let isComposing = false
		listen(this.editor, 'compositionstart', e => isComposing = true)
		listen(this.editor, 'compositionend', e => {
			isComposing = false
			this.input(e)
		})
		listen(this.editor, 'input', e => {
			if (isCaretIn(this.blk) && !isComposing) {
				this.input(e)
			}
		})
	}

	click (e) {}

	clickOutside (e) {}

	keydown (e) {
		if (e.key == 'Backspace') {
			if (this.isEmpty) {
				//delete blk
				e.preventDefault()
			} else if (this.blk.textContent == '') {
				e.preventDefault()
				this.isEmpty = true
			}
		}
		if (e.key == 'Enter' && e.shiftKey) {

		}
	}

	keyup (e) {}

	input (e) {}

	insertBlk (pos) {
		emit(this.editor, 'addBlk', { position: pos, anchor: this.element, data: '' })

	}

}

export default Blk

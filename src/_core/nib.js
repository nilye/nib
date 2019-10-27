import { qs, addClass, svg, append, attr, element, insertBefore, listen, insertAfter } from './dom'
import TextBlk from '../blocks/text'
import plus from '../assets/icon/plus.svg'
import Blk from './blk'
import { createInsertion } from '../module/util'

class Nib {

	constructor (el, config) {
		this.el = el
		this.config = config
		this.creatEditor()
		this.events = {}
	}

	creatEditor () {
		// anchor element
		if (typeof this.el == 'string') {
			this.el = document.querySelector(this.el)
		} else if (!this.el instanceof Element || this.el == null) {
			throw Error('el is not a DOM object: ' + this.el)
		}
		// create editor
		let editor = element('div', 'nib-editor')
		attr(editor, 'contenteditable', true)
		addClass(this.el, 'nib-container')
		append(editor, new TextBlk(editor, 'p', null).element)
		createInsertion(editor, () => {this.addBlk(
			{position:'append'}
		)}, true)
		append(this.el, editor)
		this.editor = editor
		this.bindEvents()
	}

	bindEvents () {
		listen(this.editor, 'addBlk', e => {this.addBlk(e.detail)})
	}

	addBlk ({ position, anchor, data }) {
		let blk = new TextBlk(this.editor, 'p', data).element
		if (position == 'insertBefore' || position == 'before') {
			insertBefore(anchor, blk)
		} else if (position == 'afterend' || position == 'after'){
			insertAfter(anchor, blk)
		} else if (position == 'append'){
			insertBefore(this.editor.querySelector('.nib-insert-last'), blk)
		}
	}

}

export default Nib
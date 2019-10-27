import Blk from '../_core/blk'
import { addClass, append, attr, collapseCaret, element } from '../_core/dom'

const types = {
	p: {
		tagName: 'p',
		className: null
	},

}

class TextBlk extends Blk {
	constructor (editor, type = 'p', data) {
		super(editor, type, types[type].tagName, types[type].className, data)
		this.createNode()
		this.clickOutside()
	}

	createNode () {
		super.createNode()
		append(this.blk, this.createSpan())
	}

	createSpan () {
		let span = element('span')
		attr(span, 'data-key-offset', this.key + ':0')
		if (this.data) {
			span.innerHTML = this.data
		} else {
			addClass(span, 'nib-pristine')
			span.innerHTML = '&#8203;'
		}
		return span
	}

	addPlaceholder () {
		if (!this.ph && this.isEmpty) {
			let ph = element('span', 'nib-paragraph-placeholder')
			attr(ph, 'style', 'opacity: 0.5;user-select: none;position:absolute;left:8px;top:0')
			attr(ph, 'contenteditable', false)
			ph.innerText = 'write something'
			this.ph = ph
			this.blk.append(ph)
		}
	}

	removePlaceholder () {
		if (this.ph) {
			this.blk.removeChild(this.ph)
			this.ph = null
		}
	}

	click (e) {
		this.addPlaceholder()
	}

	clickOutside () {
		this.removePlaceholder()
	}

	keydown (e) {
		super.keydown(e)
		if (e.key == 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
			e.preventDefault()
		}
	}

	keyup (e) {
		super.keyup(e)
		if (e.key == 'Backspace') {
			if (this.blk.textContent == '') {
				// reset to pristine
				while (this.blk.firstChild) {
					this.blk.removeChild(this.blk.firstChild)
				}
				let span = this.createSpan()
				append(this.blk, span)
				collapseCaret(span)
				this.isEmpty = true
			}
		}
		if (this.isEmpty) {
			this.addPlaceholder()
		}
	}

	input (e) {
		super.input(e)
		if (this.isEmpty) {
			// replace pristine span
			let pristine = this.blk.querySelector('.nib-pristine')
			this.blk.removeChild(pristine)
			this.data = e.data
			append(this.blk, this.createSpan())
			collapseCaret(this.blk)
			this.isEmpty = false
		}
		if (!this.isEmpty) {
			this.removePlaceholder()
		}
	}
}

export default TextBlk
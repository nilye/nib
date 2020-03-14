import { listen } from './util'

class EventBus {
	constructor (selection) {
		this.keyPool = {}
		this.inputIsComposing = false
		this.selection = selection
		this.selection.onChange(e=>{
			this.sel = e
			if (e.anchor && e.anchor.key && e.focus.key){
				this.startKey = e.anchor.key
				this.endKey = e.focus.key
			}
			if (e.focused && this.startKey) {
				this.emit(e.anchor.key, 'focus', e)
			}
			if (e.blurKey) {
				this.emit(e.blurKey, 'blur', e)
			}
		})
		listen(window, 'keyup', e => this.keyup(e))
		listen(window, 'keydown', e => this.keydown(e))
	}

	/**
	 * should bind editor HTML node element after mounted
	 * @param editor
	 */
	bindEditor(editor){
		listen(editor, 'compositionstart', () => {
			this.inputIsComposing = true
		})
		listen(editor, 'compositionend', e => {
			this.inputIsComposing = false
			this.input(e)
		})
		listen(editor, 'input', e => {
			if (!this.inputIsComposing){
				this.input(e)
			}
		})
	}

	/**
	 * bind callback function on any event emission via key
	 * @param key
	 * @param {Function} cb
	 * @returns {Function} returns a subscribe function
	 */
	on(key, cb){
		this.keyPool[key] = cb
		return () => {
			delete this.keyPool[key]
		}
	}

	/**
	 * emit event by invoke callback function
	 * @param key
	 * @param name
	 * @param event
	 */
	emit(key, name, event) {
		if (!this.keyPool[key]) return
		this.keyPool[key](name, event)
	}

	/**
	 * emit editor events to blk component
	 * @param type
	 * @param event
	 */
	emitEditorEvt(type, event){
		if (this.startKey){
			this.emit(this.startKey, type, event)
			if (this.startKey != this.endKey) {
				this.emit(this.endKey, type, event)
			}
		}
	}

	input(e){
		if (this.sel.isCollapsed){
			this.emitEditorEvt('input', e)
		}
	}


	keyup(e){
		if (this.sel.isCollapsed){
			this.emitEditorEvt('keyup', e)
		}
	}

	keydown(e){
		/* merge upwards conditions:
		1. isCollapsed and anchor mark == 0
		2. select more than one blk - anchor key and focus key is different
		*/
		if (this.sel.isCollapsed){
			this.emitEditorEvt('keydown', e)
		}
	}

}

export default EventBus
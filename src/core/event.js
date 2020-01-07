import { genKey, listen } from './util'

class EventBus {
	constructor (selection) {
		this.keyPool = {}
		this.selection = selection
		this.inputIsComposing = false
		this.sel = {}
		this.selection.onChange(e=>{
			this.sel = e
			console.log(e)
			if (e.startKey && e.endKey){
				this.startKey = e.startKey
				this.endKey = e.endKey
			}
			this.blurKey = e.blurKey
			if (e.focused && this.startKey) {
				this.emit(e.anchor.key, 'focus', e)
			}
			if (this.blurKey) {
				this.emit(e.blurKey, 'blur', e)
			}
		})
		listen(window, 'keyup', e => {
			this.emitEditorEvt('keyup', e)
		})
		listen(window, 'keydown', e => {
			this.emitEditorEvt('keydown', e)
		})
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
			this.emitEditorEvt('input', e)
		})
		listen(editor, 'input', e => {
			if (!this.inputIsComposing){
				this.emitEditorEvt('input', e)
			}
		})
	}

	// bind cb by key
	on(key, cb){
		this.keyPool[key] = cb
		return () => {
			delete this.keyPool[key]
		}
	}

	emit(key, name, event) {
		if (!this.keyPool[key]) return
		this.keyPool[key](name, event)
	}

	emitEditorEvt(type, event){
		if (this.startKey){
			this.emit(this.startKey, type, event)
			if (this.startKey != this.endKey) {
				this.emit(this.endKey, type, event)
			}
		}
	}

}

export default EventBus
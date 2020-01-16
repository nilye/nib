import { genKey, listen } from './util'
import { upperMerge } from '../model/operator'
import { blkTextContent, getValue } from '../model/util'

class EventBus {
	constructor (selection, store) {
		this.keyPool = {}
		this.inputIsComposing = false
		this.store = store
		this.selection = selection
		this.selection.onChange(e=>{
			this.sel = e
			if (e.anchor && e.anchor.key && e.focus.key){
				this.startKey = e.anchor.key
				this.endKey = e.focus.key
			}
			this.blurKey = e.blurKey
			if (e.focused && this.startKey) {
				this.emit(e.anchor.key, 'focus', e)
			}
			if (this.blurKey) {
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

	keyup(e){
		this.emitEditorEvt('keyup', e)
	}

	keydown(e){
		/* merge upwards conditions:
		1. isCollapsed and anchor mark == 0
		2. select more than one blk - anchor key and focus key is different
		*/
		const upperMergeCondition = (this.sel.isCollapsed && this.sel.anchor.mark == 0) || (this.sel.anchor.key != this.sel.focus.key)
		if (e.key == 'Backspace' && upperMergeCondition){
			let sel = {
				anchor:{
					key: this.sel.prev.key,
					path: this.sel.prev.path,
					mark: blkTextContent(getValue(this.store.getState(), this.sel.prev.path)).length
				}
			}
			upperMerge(this.store, this.sel)
			console.log(sel)
			this.selection.select(sel)
			e.preventDefault()
		} else {
			this.emitEditorEvt('keydown', e)
		}
	}

}

export default EventBus
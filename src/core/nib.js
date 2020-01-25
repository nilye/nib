import Editor from '../components/Editor.svelte'
import { addClass } from './util'
import defaultConfig from './config'
import Schema from '../model/schema'
import Selection from './selection'
import Formatter from './formatter'
import { createStore } from 'redux'
import { reducer } from '../model/reducer'
import EventBus from './event'

class Nib {

	constructor (target, config, initData) {
		// target element
		if (typeof target == 'string') {
			this.target = document.querySelector(target)
		} else if (target && target instanceof Element) {
			this.target = target
		} else {
			throw Error('el is not a DOM object: ' + target)
		}
		// init data
		if (initData && !Array.isArray(this.initData)) {
			throw TypeError('initData has to be an array:' + this.initData)
		}
		// this.initData = initData
		this.initData = [Schema.paragraph([
			Schema.text({text:"Filmmakers would generally prefer that their films, when shown in theaters (i.e. when the visual spectacle is supposed to be at its best), don't have subtitles, to maximize the aesthetic presentation of the film. ... And even when they do that, the act of reading by itself is distracting from other elements on the screen."})
		])]
		this.store = createStore(reducer, this.initData)
		this.selection = new Selection(this.target, this.store)
		this.eventBus = new EventBus(this.selection, this.store)
		this.formatter = new Formatter()
		this.config = Object.assign(defaultConfig, config)
		this.createEditor()
	}

	// create svelte component
	createEditor () {
		addClass(this.target, 'nib-container')
		this.editor = new Editor({
			target: this.target,
			props: {
				config: this.config,
				store: this.store,
				selection: this.selection,
				formatter: this.formatter,
				eventBus: this.eventBus
			}
		})
	}

	node () {
		return this.editor.editorNode
	}

	getData () {
		return this.store.getState()
	}
}

export default Nib
import Editor from '../../nib-svelte/components/Editor.svelte'
import { addClass, addToKeyPool } from './util'
import defaultConfig from './config'
import Schema from '../model/schema'
import Selection from './selection'
import Formatter from './formatter'
import EventBus from './eventBus'
import { createStore } from 'redux'
import { reducer } from '../model/state/reducer'
import { flatten } from './util'
import Operator from '../model/step/operator'
import {SvelteComponent} from "svelte/internal";

class Nib {

	target: Element
	initValue: object
	store
	selection
	eventBus
	operator
	formatter
	config: object
	editor: object

	constructor (target: string | Element, config, initValue) {
		// target element
		if (typeof target == 'string') {
			this.target = document.querySelector(target)
		} else if (target && target instanceof Element) {
			this.target = target
		} else {
			throw Error('el is not a DOM object: ' + target)
		}
		// init data
		if (initValue && !Node) {
			throw TypeError('initValue has to be an array:' + this.initValue)
		}
		// this.initValue = initValue
		this.initValue = [Schema.paragraph([
			Schema.text({text:"Filmmakers would generally prefer that their films, when shown in theaters (i.e. when the visual spectacle is supposed to be at its best), don't have subtitles, to maximize the aesthetic presentation of the film. ... And even when they do that, the act of reading by itself is distracting from other elements on the screen."})
		])]
		let initValueIndexes = flatten(this.initValue)
		addToKeyPool(initValueIndexes.keys) // avoid repeated key in keyPool
		const state = {
			value: this.initValue,
			paths: initValueIndexes.paths,
			past: [],
			future: []
		}
		this.store = createStore(xreducer, state)
		this.store.value = function (){
			return this.getState().value
		}
		this.store.paths = function (){
			return this.getState().paths
		}
		this.selection = new Selection(this.target, this.store)
		this.eventBus = new EventBus(this.selection)
		this.operator = new Operator(this.store, this.selection)
		this.formatter = new Formatter()
		this.config = Object.assign(defaultConfig, config)
		this.createEditor()
	}

	/**
	 * create svelte component!
 	 */
	createEditor(): void {
		addClass(this.target, 'nib-container')
		this.editor = new Editor({
			target: this.target,
			props: {
				context: {
					store: this.store,
					selection: this.selection,
					eventBus: this.eventBus,
					operator: this.operator,
					formatter: this.formatter,
					config: this.config,
				}
			}
		})
	}


	node(): Element {
		return this.editor['editorNode']
	}

	getData(): object {
		return this.store.getState()
	}
}

export default Nib
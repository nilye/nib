import Editor from '../components/Editor.svelte'
import { addClass } from './util'
import { get } from 'svelte/store'
import Model from './model'
import Selection from './selection'
import defaultConfig from './config'
import schema from './schema'
import Formatter from './formatter'

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
		this.initData = initData || [schema.prime()]
		this.model = new Model(this.initData)
		this.selection = new Selection(this.target)
		this.formatter = new Formatter()
		this.config = {}
		Object.assign(this.config, defaultConfig, config)
		this.createEditor()
	}

	// create svelte component
	createEditor () {
		addClass(this.target, 'nib-container')
		this.editor = new Editor({
			target: this.target,
			props: {
				config: this.config,
				model: this.model,
				selection: this.selection,
				formatter: this.formatter
			}
		})
	}

	node () {
		return this.editor.editorNode
	}

	data () {
		return this.model.data
	}
}

export default Nib
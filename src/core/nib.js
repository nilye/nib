import Editor from '../components/Editor.svelte'
import { addClass } from './dom'
import { get } from 'svelte/store'
import { Content } from '../module/store'
import defaultConfig from '../module/config'
import schema from '../module/schema'

class Nib {

	constructor (target, config, initData) {
		this.target = target
		this.initData = initData
		this.config = Object.assign(defaultConfig, config)
		// init data
		if (!this.initData) {
			Content.set([schema.prime()])
		} else if (!Array.isArray(this.initData)) {
			throw TypeError('initData has to be an array:' + this.initData)
		} else {
			Content.set(initData)
		}
		this.createEditor()
	}

	get node () {
		return this.editor.editorNode
	}

	get data () {
		return get(Content)
	}

	createEditor () {
		// target element
		if (typeof this.target == 'string') {
			this.target = document.querySelector(this.target)
		} else if (!this.target instanceof Element || this.target == null) {
			throw Error('el is not a DOM object: ' + this.target)
		}
		// create svelte component
		addClass(this.target, 'nib-container')
		this.editor = new Editor({
			target: this.target,
			props: {
				config: this.config
			}
		})
	}
}

export default Nib
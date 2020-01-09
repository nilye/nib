<svelte:options accessors={true}></svelte:options>
<div bind:this={anchorEl}></div>

<script>
	import { onMount, getContext, onDestroy } from 'svelte'
	import { element, attr, remove, setCaret, textContent } from '../core/util'
	import schema from '../model/schema'
	import { updateBlk } from '../model/action'
	import { getStoreValue } from '../model/util'

	export let key = ''
	export let path = [-1]
	export let isPrime = false

	const {config, store, selection, formatter, eventBus} = getContext('_')
	let cttNode
	let isEmpty = true
	let anchorEl
	let focusedSel

	let data = getStoreValue(store, path)
	store.subscribe(()=>{
		let oldVal = data,
				newVal = getStoreValue(store, path)
		if (oldVal !== newVal){
			data = newVal
			if (oldVal.type != newVal.type) scaffold()
			if (cttNode && data) render()
		}
	})

	/* life hooks */
	onMount(()=>{
		scaffold()
	})
	onDestroy(()=>{
	})

	/* UI parts */

	/*
* scaffold - create the parent element into DOM
* */
	const nodeOfTypes = {
		p:{ tag: 'p' },
		h1:{ tag: 'h1'},
		h2:{ tag: 'h2'},
		h3:{ tag: 'h3'}
	}
	function scaffold() {
		const parentEl = cttNode ? cttNode.parentNode : anchorEl.parentNode
		cttNode = element(nodeOfTypes[data.type].tag, 'nib-content nib-blk')
		attr(cttNode, 'data-key', key)
		attr(cttNode, 'data-nib-blk', true)
		attr(cttNode, 'data-path', path.join('.'))
		// if one exists, duplicate old content and replace to new one
		let oldNode = parentEl.querySelector(`[data-nib-blk="true"][data-key="${key}"]`)
		if (oldNode){
			cttNode.innerHTML = oldNode.innerHTML
			parentEl.replaceChild(cttNode, oldNode)
		}
		// else new element
		else {
			parentEl.replaceChild(cttNode, anchorEl)
			render()
		}
		// is empty
		isEmpty = data.nodes ? data.nodes.length === 0 : true
	}
	/**
	* @param {String} dataOffset - pass 'pristine' to create zero-width space or '{key}:{offset}'
	* @param {Object|String} node - node data
	* */
	function createSpan(dataOffset, node = {}){
		let span = element('span')
		attr(span, 'data-nib-text', true)
		if (dataOffset == 'pristine' || !dataOffset){
			attr(span, 'data-pristine', true)
			span.innerHTML = '&#8203;'
		} else {
			attr(span, 'data-offset', dataOffset)
			if (typeof node == 'string'){
				span.innerText = node
			} else if (typeof node == 'object'){
				let el = formatter.render(node)
				span.append(el)
			}
		}
		return span
	}
	function appendPh () {
		if (data.type == 'p' && !cttNode.querySelector('.nib-placeholder')){
			let ph = element('span', 'nib-placeholder')
			attr(ph, 'contenteditable', false)
			ph.innerHTML = config.editor['instruction'] || 'write something'
			cttNode.append(ph)
		}
	}
	function removePh(){
		remove(cttNode, '.nib-placeholder')
	}
	/*
	*  use render fn when `Content` data is updated externally
	* */
	function render(){
		// if it's empty, insert a no-width space
		if (!data.nodes || data.nodes.length == 0){
			cttNode.append(createSpan('pristine'))
			return
		}
		//
		let nodes = cttNode.childNodes
		for (let i=0; i < data.nodes.length; i++){
			// create new span
			let span = createSpan(key+':'+i, data.nodes[i])
			if (!nodes[i]){  // if there is no node, which it out of numbers. append span
				cttNode.append(span)
			} else if (nodes[i].innerHTML != span.innerHTML){ // need replacement
				cttNode.replaceChild(span, nodes[i])
			}
		}
		// if there is extra old span, remove them
		if (nodes.length > data.nodes.length){
			for (let j=nodes.length; j<data.nodes.length; j++){
				cttNode.removeChild(nodes[j])
			}
		}
	}

	/*
	* event handlers
	* */
	eventBus.on(key, (type, e)=>{
		eventHandlers[type](e)
	})
	const eventHandlers = {
		focus(){
			if (isEmpty) appendPh()
		},
		blur () {
			removePh()
		},
		keyup (e) {
			if (e.key == 'Backspace'){
				if (isEmpty){
					// remove blk
					e.preventDefault()
				}
				if (!textContent(cttNode)) {
					e.preventDefault()
					isEmpty = true
					while (cttNode.firstChild){
						cttNode.removeChild(cttNode.firstChild)
					}
					let span = createSpan('pristine')
					cttNode.append(span)
					setCaret(span)
					appendPh()
				}
			}
		},
		keydown (e) {
			if (e.key == 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
				e.preventDefault()
			}
			if (e.key == 'Backspace'){
				if (!textContent(cttNode)) {
					isEmpty = true
					e.preventDefault()
				}
			}
			serializeData()
		},
		input (e) {
			if (isEmpty && e.data) {
				// replace pristine span
				remove(cttNode, 'span[data-pristine="true"]')
				cttNode.append(createSpan(key+':0', e.data))
				setCaret(cttNode)
				removePh()
				isEmpty = false
			}
			serializeData()
		},
		menu(type){
			if (data['type'] != type){
				data['type'] = type
				scaffold()
				updateStore()
				if (type != 'p') removePh()
			}
		}
	}

	/*  data */
	const updateStore = () => store.dispatch(updateBlk(path, data))

	/**
	 * serialize data from current HTML dom
	 */
	function serializeData(){
		if (!isEmpty){
			data.nodes = []
			let nodes = cttNode.childNodes
			for (let i of nodes){
				data.nodes.push(schema.text({text:i.textContent}))
			}
			updateStore()
		}
	}
</script>
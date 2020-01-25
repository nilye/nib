<svelte:options accessors={true}></svelte:options>
<div bind:this={anchorEl}></div>

<script>
	import { onMount, getContext, onDestroy } from 'svelte'
	import { element, attr, remove, setCaret, textContent } from '../core/util'
	import Schema from '../model/schema'
	import { updateBlk } from '../model/action'
	import Blk from '../model/blk'
	import { equal, clone } from '../model/util'

	export let data = {}
	export let key = data.key
	export let path = [-1]
	export let isPrime = false

	const {config, store, selection, formatter, eventBus} = getContext('_')
	let cttNode
	let isEmpty = true
	let anchorEl

	// let data = getStoreValue(store, path)
	// store.subscribe(()=>{
	// 	let oldVal = data,
	// 			newVal = getStoreValue(store, path)
	// 	if (!newVal) return
	// 	if (oldVal !== newVal){
	// 		data = newVal
	// 		if (oldVal.type != newVal.type) scaffold()
	// 		if (cttNode && data) render()
	// 	}
	// })

	let oldData = {}
	$: {
		if (oldData.type != data.type) scaffold()
		else if (cttNode && !equal(oldData,data)) render()
		oldData = clone(data)
	}

	/* life hooks */
	onMount(()=>{
		scaffold()
	})
	onDestroy(()=>{})

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
		if (!anchorEl && !cttNode) return
		const parentEl = cttNode ? cttNode.parentNode : anchorEl.parentNode
		// create element
		cttNode = element(nodeOfTypes[data.type].tag, 'nib-content nib-blk')
		attr(cttNode, 'data-key', key)
		attr(cttNode, 'data-nib-blk', true)
		let oldNode = parentEl.querySelector(`[data-nib-blk="true"][data-key="${key}"]`)
		// if one exists, duplicate old content and replace to new one
		if (oldNode && equal(oldData.nodes, data.nodes)){
			cttNode.innerHTML = oldNode.innerHTML
			parentEl.replaceChild(cttNode, oldNode)
		} else {
			parentEl.replaceChild(cttNode, anchorEl)
			render()
		}
		// check if is empty
		isEmpty = data.nodes ? data.nodes.length === 0 : true
	}

	/**
	 * create text <span> element
	 * @param {String|Number} index - element index. Pass 'pristine' or -1 to create zero-width space
	 * @param {Object|Node} node - node data
	 */
	function createSpan(index = 0, node){
		let span = element('span')
		attr(span, 'data-nib-text', true)
		attr(span, 'data-key', key)
		attr(span, 'data-index', index)
		if (index == -1 || index == 'pristine' || !key){
			attr(span, 'data-pristine', true)
			attr(span, 'data-index', 0)
			span.innerHTML = '&#8203;'
		} else {
			if (typeof node == 'string'){
				span.innerText = node
			} else if (typeof node == 'object'){
				let el = formatter.render(node)
				span.append(el)
			}
		}
		return span
	}

	/**
	 * placeholder text element
	 */
	function appendPh () {
		if (!cttNode.querySelector('.nib-placeholder')){
			let ph = element('span', 'nib-placeholder')
			attr(ph, 'contenteditable', false)
			ph.innerHTML = config.editor['instruction'] || 'write something'
			cttNode.append(ph)
		}
	}
	function removePh(){
		remove(cttNode, '.nib-placeholder')
	}


	/**
	*  use render fn when `Content` data is updated externally
	*/
	function render(){
		// if it's empty, insert a no-width space
		if (!Blk.textContent(data)){
			remove(cttNode, 'span[data-pristine="true"]')
			cttNode.append(createSpan(-1))
			return
		}
		//
		let els = cttNode.childNodes
		for (let i=0; i < data.nodes.length; i++){
			// create new span
			let span = createSpan(i, data.nodes[i])
			if (!els[i]){  // if there is no node, which it out of numbers. append span
				cttNode.append(span)
			} else if (els[i].innerHTML != span.innerHTML){ // need replacement
				cttNode.replaceChild(span, els[i])
			}
		}
		// remove excess old span
		while (els.length > data.nodes.length){
			cttNode.removeChild(cttNode.lastChild)
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
					let span = createSpan(-1)
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
				cttNode.append(createSpan(0, e.data))
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
	function updateStore() {
		store.dispatch(updateBlk(path, data))
	}

	/**
	 * serialize data from current HTML dom
	 */
	function serializeData(){
		if (!isEmpty){
			data.nodes = []
			let index = selection.sel.anchor.node,
					node = cttNode.querySelector(`[data-index="${index}"]`)
			if (data.nodes.length == 0){
				data.nodes.push(Schema.text({text: node.textContent}))
			} else {
				data.nodes[index].text = node.textContent
			}
			console.log(data.nodes[index], index, data)
			updateStore()
		}
	}
</script>
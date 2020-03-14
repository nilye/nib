<svelte:options accessors={true}></svelte:options>
<div bind:this={anchorEl}></div>

<script>
	import { getContext, onDestroy, onMount } from 'svelte'
	import { attr, element, remove, setCaret, textContent } from '../../nib/core/util'
	import Keys from '../../nib/core/keys'
	import { clone, equal } from '../../nib/core/util'
	import { updateBlk } from '../../nib/model/state/action'
	import Blk from '../../nib/model/step/blk'
	import Path from '../../nib/core/path'

	export let data = {}
	export let key = data.key
	export let path = [-1]
	export let isSec = false
	export let eventHandler = {}

	const {
		config,
		store,
		selection,
		operator,
		formatter,
		eventBus
	} = getContext('_')
	let cttNode,
			anchorEl,
			isEmpty = true

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
		console.log(key, equal(oldData, data))
		if (oldData.type != data.type) scaffold()
		else if (cttNode && !equal(oldData, data)) render()
		oldData = clone(data)
	}

	/* life hooks */
	onMount(() => scaffold())
	onDestroy(() => eventOff())

	/* UI parts */

	/*
* scaffold - create the parent element into DOM
* */
	const nodeOfTypes = {
		p: { tag: 'p' },
		h1: { tag: 'h1' },
		h2: { tag: 'h2' },
		h3: { tag: 'h3' }
	}

	function scaffold(){
		if (!anchorEl && !cttNode) return
		const parentEl = cttNode ? cttNode.parentNode : anchorEl.parentNode
		// create element
		cttNode = element(nodeOfTypes[data.type].tag, 'nib-content nib-blk')
		attr(cttNode, 'data-key', key)
		attr(cttNode, 'data-nib-blk', true)
		attr(cttNode, 'data-path', Path.str(path))
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
		isEmpty = !Blk.textContent(data)
	}

	/**
	 * create text <span> element
	 * @param {String|Number} index - element index. Pass 'pristine' or -1 to create zero-width space
	 * @param {Object|Node} node - node data
	 */
	function createSpan(index = 0, node){
		let span = element('span')
		attr(span, 'data-nib-txt', true)
		attr(span, 'data-key', key)
		attr(span, 'data-index', index)
		if (index == -1 || index == 'pristine' || !key){
			attr(span, 'data-pristine', true)
			attr(span, 'data-index', 0)
			span.innerHTML = '&#8203;<br>'
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
	function appendPh(){
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

	function setPristine(){
		while (cttNode.firstChild){
			cttNode.removeChild(cttNode.firstChild)
		}
		let span = createSpan(-1)
		cttNode.append(span)
		selection.select({
			anchor: {
				key,
				mark: 0
			}
		})
		appendPh()
	}

	/**
	 *  use render fn when `Content` data is updated externally
	 */
	function render(){
		// if it's empty, insert a no-width space
		if (!Blk.textContent(data)){
			while (cttNode.childNodes.length > 0){
				cttNode.removeChild(cttNode.lastChild)
			}
			cttNode.append(createSpan(-1))
			return
		}
		//
		let els = cttNode.childNodes
		for (let i = 0; i < data.nodes.length; i++){
			// create new span
			let span = createSpan(i, data.nodes[i])
			console.log('redner',key, span)
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
	const eventOff = eventBus.on(key, (type, e) => {
		let returned
		if (eventHandler.hasOwnProperty(type) && typeof eventHandler[type] === 'function'){
			returned = eventHandler[type](e)
		}
		if (!returned){
			nativeEventHandler[type](e)
		}
	})

	const nativeEventHandler = {
		select(){},
		focus(){
			if (isEmpty) appendPh()
		},
		blur(){
			removePh()
		},
		keyup(e){
			if (Keys.is('delete', e)){
				if (isEmpty) e.preventDefault()
			}
		},
		keydown(e){
			if (Keys.is('delete',e)){
				if (isEmpty) e.preventDefault()
			}

			// `delete` key - merge
			const upwardMerge = Keys.is('deleteBackward', e) && selection.sel.isCollapsed && selection.sel.anchor.mark == 0,
					downwardMerge = Keys.is('deleteForward', e) && selection.sel.isCollapsed && selection.sel.anchor.mark == Blk.textLength(data)
			if (upwardMerge || downwardMerge){
				operator.mergeBlk(path, {upward:upwardMerge})
				e.preventDefault()
				console.log('merge')
			}

			// `enter` key - split
			if (Keys.is('enter', e) && selection.sel.isCollapsed){
				operator.splitBlk(path, selection.sel.anchor.mark)
				e.preventDefault()
			}

			serializeData(e)
		},
		input(e){
			const inputSpan = cttNode.querySelector(`[data-index="${selection.sel.anchor.node}"]`)
			if (inputSpan && inputSpan.dataset.pristine){
				// replace pristine span
				cttNode.removeChild(inputSpan)
				cttNode.append(createSpan(0, e.data))
				// setCaret(cttNode)
				selection.select({
					anchor: {
						...selection.sel.anchor,
						mark: e.data.length
					}
				})
				removePh()
			}
			serializeData(e)
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
	function updateStore(){
		store.dispatch(updateBlk(path, data))
	}

	/**
	 * serialize data from current HTML dom
	 */
	function serializeData(e = {} ,strict = true){
		if (e.defaultPrevented) {
			return
		}

		let index = selection.sel.anchor.node,
				node = cttNode.querySelector(`[data-index="${index}"]`)
		if (!node || node.dataset.pristine) strict = true


		if (strict){
			const children = cttNode.querySelectorAll('[data-nib-txt="true"]')
			data.nodes = []
			children.forEach(child => {
				data.nodes.push(Schema.text({
					text: child.dataset.pristine ? '' : child.textContent
				}))
			})
		} else {
			if (data.nodes.length == 0){
				data.nodes.push(Schema.text({ text: node.textContent }))
			} else {
				data.nodes[index].text = node.textContent
			}
		}

		isEmpty = !Blk.textContent(data)
		if (isEmpty) setPristine()
		updateStore()
	}
</script>
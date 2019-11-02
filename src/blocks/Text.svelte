<svelte:options accessors={true}></svelte:options>
<div bind:this={anchorEl}></div>

<script>
	import { onMount, getContext, onDestroy } from 'svelte'
	import { element, attr, remove, setCaret, textContent } from '../core/util'
	import schema from '../core/schema'
	import paragraphIcon from '../assets/icon/paragraph.svg'
	import heading1Icon from '../assets/icon/heading1.svg'
	import heading2Icon from '../assets/icon/heading2.svg'
	import heading3Icon from '../assets/icon/heading3.svg'

	export let key
	export let indexes = [-1]
	export let isPrime = false

	let data
	let cttNode
	let isEmpty = true
	let anchorEl
	let focusedSel
	const {config, model, selection, formatter} = getContext('_')

	model.subscribe(v=>{
		console.log('vvvvvvv', v)
		let u = [...v]
		for (let k in indexes) u = u[k]
		console.log(data, model)
		if (data != u) {
			data = {...u}
		}
		if (cttNode && data) render()
	})

	/* life hooks */
	onMount(()=>{
		scaffold()
	})
	onDestroy(()=>{
	})

	/*
	* scaffold the parent element into DOM
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
		attr(cttNode, 'data-index', indexes.join('.'))
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
		// data
		isEmpty = data.nodes ? data.nodes.length === 0 : true
	}

	/*
	* mini UI parts
	* */
	/**
	* @param {String} dataOffset - pass 'pristine' to create zero-width space or '{key}:{offset}'
	* @param {Object|String} node - node data
	* */
	function createSpan(dataOffset, node){
		let span = element('span')
		attr(span, 'data-nib-text', true)
		if (dataOffset == 'pristine' || !dataOffset){
			attr(span, 'data-pristine', true)
			span.innerHTML = '&#8203;'
		} else {
			attr(span, 'data-offset', dataOffset)
			if (typeof node == 'string'){
				span.innerText = node
			} else if (typeof node == 'object' && !node.attr){
				span.innerText = node.text
			} else {
				let el = formatter.render(node.text, node.attr)
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
		for (let i=0; i<data.nodes.length; i++){
			// create new span
			let span = createSpan(key+':'+i, data.nodes[i])
			if (!nodes[i]){  // if there is no node, which it out of numbers. append span
				cttNode.append(span)
			} else if (nodes[i].innerText != data.nodes[i].text){ // need replacement
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
	export function onFocus () {
		if (isEmpty) appendPh()
	}
	export function onBlur () {
		removePh()
	}
	export function onKeyup (e) {
		if (e.key == 'Backspace'){
			if (isEmpty){
				// remove blk
			} else if (!textContent(cttNode)) {
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
	}
	export function onKeydown (e) {
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
	}
	export function onInput (e) {
		console.log('++', data)
		if (isEmpty) {
			// replace pristine span
			remove(cttNode, 'span[data-pristine="true"]')
			cttNode.append(createSpan(key+':0', e.data))
			setCaret(cttNode)
			removePh()
			isEmpty = false
		}
		serializeData()
	}
	/*
	* menus
	* */
	function menuMethod(type){
		if (data['type'] != type){
			data['type'] = type
			scaffold()
			updateModel()
			if (type != 'p') removePh()
			selection.reSelect()
		}
	}
	export const menu = () => [
		{
			icon: paragraphIcon,
			name: 'Paragraph',
			method: () => menuMethod('p')
		},{
			icon: heading1Icon,
			name: 'Heading 1',
			method: () => menuMethod('h1')
		},{
			icon: heading2Icon,
			name: 'Heading 2',
			method: () => menuMethod('h2')
		},{
			icon: heading3Icon,
			name: 'Heading 3',
			method: () => menuMethod('h3')
		}
	]

	/*
	* models
	* */
	const updateModel = () => model.updateBlk(indexes, data)
	function serializeData(){
		if (!isEmpty){
			data.nodes = []
			let nodes = cttNode.childNodes
			for (let i of nodes){
				data.nodes.push(schema.text({text:i.textContent}))
			}
			updateModel()
		}
	}
</script>
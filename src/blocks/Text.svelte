<script>
	import { onMount, getContext } from 'svelte'
	import { element, attr, qs, remove, setCaret, content } from '../core/dom'
	import { Content } from '../module/store'
	import schema from '../module/schema'
	import paragraphIcon from '../assets/icon/paragraph.svg'
	import heading1Icon from '../assets/icon/heading1.svg'
	import heading2Icon from '../assets/icon/heading2.svg'
	import heading3Icon from '../assets/icon/heading3.svg'
	export let key
	export let index = -1

	let data
	let cttNode
	let isEmpty = true
	let blkWrapper
	const config = getContext('config')
	const nodeOfTypes = {
		p:{ tag: 'p' },
		h1:{ tag: 'h1'},
		h2:{ tag: 'h2'},
		h3:{ tag: 'h3'}
	}

	Content.subscribe(v=>{
		if (data != v[index] && v[index].key == key){
			data = v[index]
			if (cttNode) render()
		}
	})

	onMount(()=>{
		scaffold()
	})

	/*
	* scaffold the parent element into DOM
	* */
	function scaffold() {
		blkWrapper = qs(`.nib-blk[data-key="${key}"]`)
		cttNode = element(nodeOfTypes[data.type].tag, 'nib-content')
		attr(cttNode, 'data-key', key)
		// duplicate old content if any
		let oldNode = blkWrapper.querySelector('.nib-content')
		if (oldNode){
			cttNode.innerHTML = oldNode.innerHTML
			blkWrapper.replaceChild(cttNode, oldNode)
		}
		// else append new element
		else {
			blkWrapper.append(cttNode)
			render()
		}
		// data
		if (data.nodes && data.nodes.length === 0){
			isEmpty = true
		}
	}

	/*
	* view mini components
	* */
	function createSpan(dataOffset, text){
		let span = element('span')
		attr(span, 'data-nib-text', true)
		if (dataOffset == 'pristine' || !dataOffset){
			attr(span, 'data-pristine', true)
			span.innerHTML = '&#8203;'
		} else {
			attr(span, 'data-offset', dataOffset)
			span.innerText = text
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
			let span = createSpan(key+':'+i, data.nodes[i].text)
			if (!nodes[i]){  // if there is no node, which it out of numbers. append span
				cttNode.append(span)
			} else if (nodes[i].innerText != t){ // need replacement
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
			if (!content(cttNode)) {
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
			if (!content(cttNode)) {
				isEmpty = true
				e.preventDefault()
			}
		}
		serializeData()
	}
	export function onInput (e) {
		if (isEmpty) {
			// replace pristine span
			remove(cttNode, 'span[data-pristine="true"]')
			cttNode.append(createSpan(key+':0', e.data))
			setCaret(cttNode)
			isEmpty = false
		}
		if (!isEmpty) {
			remove(cttNode, '.nib-placeholder')
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
			updateContent()
			if (type != 'p'){
				removePh()
			}
		}
	}
	export const menu = () => [{
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
	}]

	/*
	* models
	* */
	function updateContent() {
		Content.update(content => {
			content[index] = data
			return content
		})
	}
	function serializeData(){
		let newData = Object.assign(data,{type: data.type})
		if (!isEmpty){
			newData.nodes = []
			let nodes = cttNode.childNodes
			for (let i of nodes){
				newData.nodes.push(schema.text({text:i.textContent}))
			}
			data = newData
			updateContent()
		}
	}
</script>
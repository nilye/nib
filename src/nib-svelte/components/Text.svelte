<span data-nib-text="true"
      bind:this="{ domNode }">
	{@html pristine ? '&#8203;<br>' : ''}
</span>

<script>
	import { onMount, beforeUpdate, getContext } from 'svelte'
	import { Formats } from 'nib'

	export let value = {}
	export let path = []
	export let pristine = false
	const editor = getContext('editor')
	let domNode

	beforeUpdate(()=>{
		render()
		editor.bindPath(domNode, path, value)
	})

	onMount(()=>{
		if (pristine) domNode.setAttribute('data-pristine', true)
	})

	function render(){
		if (!pristine){
			if (!domNode) return
			const textLeaf = Formats.render(value)
			// remove all children from domNode and append new textLeaf
			while (domNode.firstChild) {
				domNode.removeChild(domNode.lastChild)
			}
			domNode.append(textLeaf)
		}
	}
</script>
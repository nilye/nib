<span data-nib-node="inl" bind:this={domNode}>
	{#if Node.hasTextContent(value)}
		{#each value.nodes as node, index}
			<Text value={node} path={Path.push(path, index)}></Text>
		{/each}
	{:else}
		<Text pristine={true} path={Path.push(path, 0)}></Text>
	{/if}
</span>

<script>
	import Text from "./Text.svelte"
	import { beforeUpdate, getContext } from 'svelte'
	import {Path, Node} from 'nib'

	export let value = {}
	export let path = []

	const editor = getContext('editor')
	let domNode

	beforeUpdate(()=>{
		editor.bindPath(domNode, path, value)
	})
</script>

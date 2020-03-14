<div class="nib-toolbar"
     style="left: {x}px; top: {y}px;"
     class:_active={show}
     bind:this={toolbarNode}>
	{#each items as slot}
		{#each slot as item}
			<div class="nib-icon-btn round"
			     class:_active={activeFormats[item.name]}
			     on:mouseup|stopPropagation={()=>onClick(item.name)}>
				{@html item.icon}
			</div>
		{/each}
	{/each}
	{#if !isEmpty(activeFormats) }
		<div class="nib-toolbar-divider"></div>
		<div class="nib-icon-btn round">
			{@html Icons.clean}
		</div>
	{/if}
</div>

<script>
	import { onMount, getContext, tick } from 'svelte'
	import { Icons, Range, isEmpty } from 'nib'

	const editor = getContext('editor')
	const items = [
		[
			{name: 'bold', icon: Icons.bold},
			{name: 'italic', icon: Icons.italic},
			{name: 'underline', icon: Icons.underline},
			{name: 'strike', icon: Icons.strike}
		]
	]
	let toolbarNode, nibContainer, x, y, show, range,
			activeFormats = {}

	editor.onSelect(e => onSelect(e))

	onMount(() => {
		nibContainer = toolbarNode.parentNode
	})

	function onSelect(e) {
		range = e.range || null
		activeFormats = range ? range.formats : {}
		if (range && !range.isCollapsed && editor.domElement) {
			const p = Range.getBound(editor)
			x = p.x
			y = p.y - 44
			show = true
		} else {
			show = false
		}
	}

	function onClick (formatName) {

	}

</script>
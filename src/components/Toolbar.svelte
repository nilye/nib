<div class="nib-toolbar"
     style="left: {x}px; top: {y}px;"
     class:_active={show}
     bind:this={toolbarNode}>
	{#each items[0] as item}
		<div class="nib-icon-btn round"
		     class:_active={activeAttr[item.name]}
		     on:mouseup|stopPropagation={()=>onClick(item.name)}>
			{@html item.icon}
		</div>
	{/each}
	{#if activeAttr.isDirty}
		<div class="nib-toolbar-divider"></div>
		<div class="nib-icon-btn round">
			{@html cleanIcon}
		</div>
	{/if}
</div>

<script>
	import { onMount, getContext } from 'svelte'
	import cleanIcon from '../assets/icon/clean-format.svg'

	const { selection, model, formatter} = getContext('_')
	const items = [formatter.toolbar()]
	let toolbarNode, nibContainer, sel, x, y, show
	let activeAttr = {}
	selection.onChange(e => onSelect(e))

	onMount(() => {
		nibContainer = toolbarNode.parentNode
	})

	function onSelect (e) {
		if (!e.sel.isCollapsed && nibContainer) {
			let range = e.sel.getRangeAt(0),
					rangeRect = range.getBoundingClientRect(),
					contRect = nibContainer.getBoundingClientRect()
			x = rangeRect.x - contRect.x + rangeRect.width / 2
			y = rangeRect.y - contRect.y - 40
			show = true
			if (e.startNode) {
				activeAttr = formatter.contains(e)
			}
		} else {
			show = false
		}
	}

	function onClick (formatName) {
		let toggle = true
		if (activeAttr[formatName] &&
				formatter.allContain(selection.sel, formatName)){
			toggle = false
		}
		model.format(selection.sel, formatter[formatName], toggle)
	}

</script>
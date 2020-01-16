<div class="nib-toolbar"
     style="left: {x}px; top: {y}px;"
     class:_active={show}
     bind:this={toolbarNode}>
	{#each items as slot}
		{#each slot as item}
			<div class="nib-icon-btn round"
			     class:_active={activeAttr[item.name]}
			     on:mouseup|stopPropagation={()=>onClick(item.name)}>
				{@html item.icon}
			</div>
		{/each}
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
	import { formatSelection } from '../model/operator'

	const { selection, store, formatter } = getContext('_')
	const items = [formatter.toolbar.basic]
	console.log(items)
	let toolbarNode, nibContainer, x, y, show
	let activeAttr = {},
			thoroughAttr = {}
	selection.onChange(e => onSelect(e))

	onMount(() => {
		nibContainer = toolbarNode.parentNode
	})

	function onSelect (selection) {
		if (!selection.isCollapsed && nibContainer && selection.sel) {
			let range = selection.sel.getRangeAt(0),
					rangeRect = range.getBoundingClientRect(),
					contRect = nibContainer.getBoundingClientRect()
			x = rangeRect.x - contRect.x + rangeRect.width / 2
			y = rangeRect.y - contRect.y - 40
			show = true
			// extract active attribute (format)
			const active = formatter.activeAttr(store.getState(), selection)
			activeAttr = active.attr
			thoroughAttr = active.thorough
		} else {
			show = false
		}
	}

	function onClick (formatName) {
		let value = true
		if (activeAttr[formatName] && thoroughAttr[formatName]){
			value = false
		}
		formatSelection(store, selection.sel, formatter.formats[formatName], value)
		selection.reSelect()
	}

</script>
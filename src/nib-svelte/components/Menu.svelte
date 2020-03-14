<div bind:this="{menuDiv}" data-path={path}>
	<div class="nib-icon-btn outline"
	     on:click={ ()=> menuActive = !menuActive }>
		{@html Icons.chevronDown}
	</div>
	<div class="nib-menu nib-card" class:_active="{ menuActive }">
		{#each manifest.menus as item}
			<div class="nib-menu-tile"
			     on:mouseup|stopPropagation="{()=> onClick(item.value)}">
				{@html item.icon}
				<span>{ item.name }</span>
			</div>
		{/each}
		<div class="nib-menu-divider"></div>
		<div class="nib-menu-tile"
		     on:click="{onDelete}">
			{@html Icons.trash}
			<div>Delete</div>
		</div>
	</div>
</div>

<script>
	import { onMount, getContext } from 'svelte'
	import { Icons, DOM } from 'nib'

	export let key = ''
	export let path = []
	export let manifest = {}
	let menuActive = false
	let menuDiv
	const editor = getContext('editor')

	onMount(()=>{
		DOM.clickOutside(menuDiv, ()=> menuActive = false)
	})

	function onClick(value){
		menuActive = false
		manifest.method(editor, path, value)
	}

	function onDelete(){
		menuActive = false
		console.log(path)
		editor.removeNode(path)
	}
</script>
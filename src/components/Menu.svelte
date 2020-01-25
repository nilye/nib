<div bind:this="{menuDiv}">
	<div class="nib-icon-btn outline"
	     on:click={ ()=> menuActive = !menuActive }>
		{@html chevronDown}
	</div>
	<div class="nib-menu nib-card" class:_active="{ menuActive }">
		{#each items as item}
			<div class="nib-menu-tile"
			     on:mouseup|stopPropagation="{()=> onClick(item.data)}">
				{@html item.icon}
				<div>{ item.name }</div>
			</div>
		{/each}
		<div class="nib-menu-divider"></div>
		<div class="nib-menu-tile"
		     on:click="{onDelete}">
			{@html trash}
			<div>Delete</div>
		</div>
	</div>
</div>

<script>
	import chevronDown from '../assets/icon/chevron-down.svg'
	import trash from '../assets/icon/trash.svg'
	import { onMount, getContext } from 'svelte'
	import { clickOutside } from '../core/util'
	import { removeBlk } from '../model/action'

	export let key = ''
	export let path = []
	export let items = []
	let menuActive = false
	let menuDiv
	const {eventBus, selection, store} = getContext('_')

	onMount(()=>{
		clickOutside(menuDiv, ()=> menuActive = false)
	})

	function onClick(data){
		menuActive = false
		eventBus.emit(key, 'menu', data)
		selection.reSelect()
	}

	function onDelete(){
		store.dispatch(removeBlk(path))
	}
</script>
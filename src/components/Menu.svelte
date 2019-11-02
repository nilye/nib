<div bind:this="{menuDiv}">
	<div class="nib-icon-btn outline"
	     on:click={ ()=> menuActive = !menuActive }>
		{@html chevronDown}
	</div>
	<div class="nib-menu nib-card" class:_active="{ menuActive }">
		{#each items as item}
			<div class="nib-menu-tile" on:click={item.method} on:mouseup="{()=> menuActive = false}">
				{@html item.icon}
				<div>{ item.name }</div>
			</div>
		{/each}
		<div class="nib-menu-divider"></div>
		<div class="nib-menu-tile"
		     on:click="{()=> menuActive = false}">
			{@html trash}
			<div>Delete</div>
		</div>
	</div>
</div>

<script>
	import chevronDown from '../assets/icon/chevron-down.svg'
	import trash from '../assets/icon/trash.svg'
	import { onMount } from 'svelte'
	import { clickOutside } from '../core/util'

	export let items = []
	export let type = 'p'
	let menuActive = false
	let menuDiv

	onMount(()=>{
		clickOutside(menuDiv, ()=> menuActive = false)
	})
</script>
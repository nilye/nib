<div class="nib-blk" on:click="" data-key={key}>
	<Insertion index={index}></Insertion>
	<div class="nib-blk-ctrl" contenteditable="false">
		<div class="nib-blk-handle"></div>
	</div>
	<svelte:component
			this={blocks[type]}
			bind:this={cttComp}
			key={key}
			type={type}
			index={index}
	></svelte:component>
</div>

<script>
	import chevronDown from '../assets/icon/chevron-down.svg'
	import trash from '../assets/icon/trash.svg'
	import Insertion from './Insertion.svelte'
	import { clickOutside } from '../core/dom'
	import { onMount } from 'svelte'
	import blocks from '../blocks/manifest'

	export let key
	export let index = -1
	export let type = 'p'
	let cttComp
	let menuActive = false
	let menuDiv

	onMount(()=>{
		clickOutside(menuDiv, ()=> menuActive = false)
		cttComp.changeType()
	})

	// event handlers
	function click(e){

	}
</script>
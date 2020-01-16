<div class="nib-insert" class:nib-insert-first={first} contenteditable="false">
	<div class="nib-icon-btn small" on:click="{insert}">
		{@html plus}
	</div>
	<div class="nib-insert-line"></div>
</div>

<script>
	import plus from '../assets/icon/plus.svg'
	import schema from '../model/schema'
	import { getContext } from 'svelte'
	import { insertBlk } from '../model/action'

	export let index = -1
	export let first = false

	const { store } = getContext('_')
	function insert () {
		store.dispatch(insertBlk(first ? 0 : index+1, schema.paragraph()))
	}
</script>

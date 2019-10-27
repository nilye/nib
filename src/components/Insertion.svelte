<div class="nib-insert" class:nib-insert-first={first} contenteditable="false">
	<div class="nib-icon-btn small" on:click="{insert}">
		{@html plus}
	</div>
	<div class="nib-insert-line"></div>
</div>

<script>
	import plus from '../assets/icon/plus.svg'
	import eventBus from '../module/eventbus'
	import { Content } from '../module/store'
	import schema from '../module/schema'

	export let index = -1
	export let first = false
	function insert () {
		Content.update(v => {
			if (first){
				v.unshift(schema.prime())
			} else {
				v.splice(index+1, 0, schema.prime())
			}
			return v
		})
	}
</script>
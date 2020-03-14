<div class="nib-insert" class:nib-insert-first={first} contenteditable="false">
	<div class="nib-icon-btn small" on:click="{insert}">
		{@html Icons.plus}
	</div>
	<div class="nib-insert-line"></div>
</div>

<script>
	import { beforeUpdate, getContext } from 'svelte'
	import {Icons, Element, Path} from 'nib'

	export let path = [0]
	export let first = false

	const editor = getContext('editor')

	function insert () {
		if (first){
			editor.insertNode([0], Element.paragraph())
		} else {
			editor.insertNode(Path.next(path), Element.paragraph())
		}
	}
</script>

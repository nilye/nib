<svelte:options accessors={true}></svelte:options>
<div class="nib-container">
<!--	<Toolbar></Toolbar>-->
	<EditorComp></EditorComp>
</div>

<script>
	import { onDestroy, onMount, setContext, tick } from 'svelte'
	import Toolbar from './Toolbar.svelte'
	import EditorComp from './Editor.svelte'
	import { Editor } from 'nib'

	export let initValue

	const editor = new Editor({
		initValue: initValue
	})
	setContext('editor', editor)

	export let value = editor.value()

	// life hooks
	onMount(() => {
	})

</script>

{#if value.type === 'h1'}

	<h1 data-nib-node="blk" data-type="h1">
		<TextBlock value={value} path={path}></TextBlock>
	</h1>

{:else if value.type === 'h2'}

	<h2 data-nib-node="blk" data-type="h2">
		<TextBlock value={value} path={path}></TextBlock>
	</h2>

{:else if value.type === 'h3'}

	<h3 data-nib-node="blk" data-type="h3">
		<TextBlock value={value} path={path}></TextBlock>
	</h3>

{:else}

	<p data-nib-node="blk" data-type="p">
		<TextBlock value={value} path={path}></TextBlock>
	</p>

{/if}

<script>
	import TextBlock from './TextBlock.svelte'

	export let value = {}
	export let path = []
	export let menu = [{
		name: 'paragraph'
	}]

	let dom

	function change () {
		let newNode = document.createElement('h1')
		newNode.innerHTML = dom.innerHTML
		dom.parentNode.replaceChild(newNode, dom)
	}


</script>
{#each value.nodes as node, index (node.key)}
	<Inline value={node} path={Path.push(path, index)}></Inline>
{/each}

<script>
	import { Path } from '../../nib/core/path'
	import Inline from '../components/Inline.svelte'

	export let value = {}
	export let path = []
</script>
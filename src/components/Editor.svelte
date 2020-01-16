<svelte:options accessors={true}></svelte:options>
<Toolbar></Toolbar>
<div class="nib-editor"
     contenteditable="true"
     autocapitalize="off"
     autocomplete="off"
     autocorrect="off"
     spellcheck="false"
     bind:this={ editorNode }>
	<Insertion first={true}></Insertion>
	{#each storeVal as prime, index (prime.key)}
		<div class="nib-prime"
		     data-key={prime.key}
		     data-type={prime.type}
		     data-nib-blk="true">
			<Insertion index={index}></Insertion>
			<div class="nib-prime-ctrl" contenteditable="false">
				<div class="nib-prime-handle"></div>
				<Menu
						key={prime.key}
						path={[index]}
						items={manifesto[prime.type].menu}></Menu>
			</div>
			<svelte:component
					this={manifesto[prime.type].component}
					key={prime.key}
					path={[index]}
					isPrime={true}>
			</svelte:component>
		</div>
	{/each}
</div>

<script>
	import { onMount, setContext } from 'svelte'
	import Insertion from './Insertion.svelte'
	import Menu from './Menu.svelte'
	import Toolbar from './Toolbar.svelte'
	import manifesto from '../blocks/manifest'

	export let editorNode
	export let config
	export let store
	export let selection
	export let formatter
	export let eventBus
	let storeVal = []

	if (config && store && selection && formatter && eventBus){
		setContext('_' , {
			config,
			store,
			selection,
			formatter,
			eventBus
		})
		store.subscribe(()=> {
			storeVal = store.getState()
		})
		store.dispatch({type:''})
	}
	onMount(()=>{
		eventBus.bindEditor(editorNode)
		// selection.onChange(e => onSelectChange(e))
	})

</script>
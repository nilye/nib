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
						key={ prime.key }
						items={manifesto[prime.type].menu}></Menu>
			</div>
			<svelte:component
					this={manifesto[prime.type].component}
					key={prime.key}
					path={[index]}
					isPrime={true}
			></svelte:component>
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

	console.log(manifesto)
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

	/*
	* binding events
	* */
/*	function onSelectChange (e) {
		sel = e
		console.log(e, primes)
		activePrime = primes[e.startPrimeKey]
		endPrime = primes[e.endPrimeKey]
		let inactivePrime = primes[e.lastPrimeKey]
		if (e.focused && activePrime) {
			if (activePrime.onSelect) activePrime.onSelect(e)
			if (activePrime.onFocus) activePrime.onFocus(e)
			if (inactivePrime && inactivePrime.onBlur) inactivePrime.onBlur(e)
		} else if (inactivePrime) {
			if (inactivePrime.onBlur) inactivePrime.onBlur(e)
		}
	}

	// editor
	function onCompositionStart () {
		inputIsComposing = true
	}

	function onCompositionEnd (e) {
		inputIsComposing = false
		onInput(e)
	}

	function bindEvents(type, e){
		if (activePrime){
			if (typeof activePrime[type] === 'function') activePrime[type](e)
			if (!sel.samePrime && typeof endPrime[type] === 'function') endPrime[type](e)
		}
	}
	function onInput (e) {
		if (!inputIsComposing){
			bindEvents('onInput', e)
		}
	}
	function onKeyup (e) {
		bindEvents('onKeyup', e)
	}
	function onKeydown (e) {
		bindEvents('onKeydown', e)
	}*/

</script>
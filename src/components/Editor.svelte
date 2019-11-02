<svelte:options accessors={true}></svelte:options>
<svelte:window
		on:keyup={ onKeyup }
		on:keydown={ onKeydown }
></svelte:window>
<Toolbar></Toolbar>
<div class="nib-editor"
     contenteditable="true"
     on:input={ onInput }
     on:compositionstart={ onCompositionStart }
     on:compositionend={ onCompositionEnd }
     bind:this={ editorNode }>
	<Insertion first={true}></Insertion>
	{#each $model as prime, index (prime.key)}
		<div class="nib-prime"
		     data-key={prime.key}
		     data-index={index}
		     data-type={prime.type}
		     data-nib-prime="true">
			<Insertion index={index}></Insertion>
			<div class="nib-prime-ctrl" contenteditable="false">
				<div class="nib-prime-handle"></div>
				<Menu
						key={ prime.key }
						items={ primes[prime.key] ? primes[prime.key].menu() : [] }
				></Menu>
			</div>
			<svelte:component
					this={manifesto[prime.type]}
					bind:this={primes[prime.key]}
					key={prime.key}
					indexes={[index]}
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
	export let model
	export let selection
	export let formatter
	let inputIsComposing = false
	let sel = {}
	let primes = {}
	let activePrime = {}
	let endPrime = {}

	// Content.subscribe(v=>console.log(v))
	if (config && model && selection){
		setContext('_' , { config, model, selection, formatter})
	}
	onMount(()=>{
		selection.onChange(e => onSelectChange(e))
	})

	/*
	* binding events
	* */
	function onSelectChange (e) {
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
		bindEvents('onInput', e)
	}
	function onKeyup (e) {
		bindEvents('onKeyup', e)
	}
	function onKeydown (e) {
		bindEvents('onKeydown', e)
	}

</script>
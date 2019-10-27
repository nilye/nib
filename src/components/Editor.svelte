<svelte:options accessors={true}></svelte:options>
<svelte:window
		on:keyup={ onKeyup }
		on:keydown={ onKeydown }
></svelte:window>
<div class="nib-editor"
     contenteditable="true"
     on:input={ onInput }
     on:compositionstart={ onCompositionStart }
     on:compositionend={ onCompositionEnd }
     bind:this={ editorNode }>
	<Insertion first={true}></Insertion>
	{#each $Content as prime, index (prime.key)}
		<div class="nib-blk"
		     data-key={prime.key}
		     data-type={prime.type}
		     data-nib-blk="true">
			<Insertion index={index}></Insertion>
			<div class="nib-blk-ctrl" contenteditable="false">
				<div class="nib-blk-handle"></div>
				<Menu
						key={ prime.key }
						items={ blks[prime.key] ? blks[prime.key].menu() : [] }
				></Menu>
			</div>
			<svelte:component
					this={manifesto[prime.type]}
					bind:this={blks[prime.key]}
					key={prime.key}
					index={index}
			></svelte:component>
		</div>
	{/each}
</div>

<script>
	import eventBus from '../module/eventbus'
	import { onMount, setContext } from 'svelte'
	import Insertion from './Insertion.svelte'
	import manifesto from '../blocks/manifest'
	import { Content } from '../module/store'
	import Menu from './Menu.svelte'
	import Sel from '../core/sel'
	import schema from '../module/schema'

	export let editorNode
	export let config
	let inputIsComposing = false
	let selection
	let blks = {}
	let activeBlk = {}
	let endBlk = {}

	//
	Content.subscribe(v=>console.log(v))

	//
	setContext('config', config)
	onMount(() => {
		new Sel(editorNode).onChange(e=>onSelectChange(e))
		const addBlkEvt = eventBus.on('addBlk', addBlk)
		return () => {
			addBlkEvt.off()
		}
	})

	/*
	* binding events
	* */
	function onSelectChange(e){
		selection = e
		activeBlk = blks[e.startKey]
		endBlk = blks[e.endKey]
		let inactiveBlk = blks[e.lastActiveKey]
		if (e.focused && activeBlk) {
			if (activeBlk.onSelect) activeBlk.onSelect(e)
			if (activeBlk.onFocus) activeBlk.onFocus(e)
			if (inactiveBlk && inactiveBlk.onBlur) blks[e.lastActiveKey].onBlur(e)
		} else if (inactiveBlk){
			if (inactiveBlk.onBlur) blks[e.lastActiveKey].onBlur(e)
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
	function onInput (e) {
		if (activeBlk.onInput)activeBlk.onInput(e)
		if (endBlk.onInput) endBlk.onInput(e)
	}

	// window
	function onKeyup (e) {
		if (activeBlk.onKeyup) activeBlk.onKeyup(e)
		if (endBlk.onKeyup) endBlk.onKeyup(e)
	}
	function onKeydown (e) {
		if (activeBlk.onKeydown) activeBlk.onKeydown(e)
		if (endBlk.onKeydown) endBlk.onKeydown(e)
	}

</script>
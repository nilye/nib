<svelte:options accessors={true}></svelte:options>
<Toolbar></Toolbar>
<div class="nib-editor"
     contenteditable="true"
     autocapitalize="off"
     autocomplete="off"
     autocorrect="off"
     spellcheck="false"
     data-nib-editor="true"
     on:beforeinput={ beforeInput }
     on:compositionstart={ compositionStart }
     on:compositionend={ compositionEnd }
     bind:this={ domElement }>
	<Insertion first={true}></Insertion>
<!--	{#each storeVal as sec, index (sec.key)}-->
<!--		<div class="nib-sec"-->
<!--		     data-key={sec.key}-->
<!--		     data-type={sec.type}-->
<!--		     data-nib-sec="true">-->
<!--			<Insertion path={[index]}></Insertion>-->
<!--			<div class="nib-sec-ctrl" contenteditable="false">-->
<!--				<div class="nib-sec-handle"></div>-->
<!--				<Menu key={sec.key}-->
<!--				      path={[index]}-->
<!--				      items={blkManifest[sec.type].menu}>-->
<!--				</Menu>-->
<!--			</div>-->
<!--			<svelte:component-->
<!--					this={blkManifest[sec.type].component}-->
<!--					data={sec}-->
<!--					key={sec.key}-->
<!--					path={[index]}-->
<!--					isSec={true}>-->
<!--			</svelte:component>-->
<!--		</div>-->
<!--	{/each}-->
		{#each storeValue.nodes as prime, index (prime.key)}
			<Prime value={prime} path={Path.normalize(index)}></Prime>
		{/each}
</div>

<script>
	import { onDestroy, onMount, getContext, tick } from 'svelte'
	import blkManifest from '../element/manifest'
	import Prime from './Prime.svelte'
	import Toolbar from './Toolbar.svelte'
	import { Range, Path } from 'nib'
	import Insertion from './Insertion.svelte'

	export let domElement

	const editor = getContext('editor')
	let isComposing = false

	// store state
	let storeValue = editor.value()
	const unsubscribe = editor.store.subscribe(() => {
		storeValue = editor.value()
	})

	// life hooks
	onMount(() => {
		editor.bindDOMNode(domElement)
	})

	/**
	 *  event handler
	 */
	/**
	 * selection
	 * bind `selectionchange` to document, and getSelection()
	 * selection may set from somewhere else, `updateDOMSelect` if needed
	 */
	document.addEventListener('selectionchange', selectionChange)

	function selectionChange (e) {
		if (!isComposing) { // dont get selection if it's still composing
			editor.getSelection()
		}
	}

	editor.onSelect(async data => {
		if (data.updateDOMSelect) {
			await tick() // await till the dom update is completed
			console.log(data.range)
			Range.setDOMSelection(editor, data.range)
		}
	})

	/**
	 * composition
	 * compositionEnd event will triggered after `beforeinput` and `input`, also it is the only place that will get the final composed data. Thus, update the editor state here, instead of handle it in `beforeInput()`
	 */
	function compositionStart () { isComposing = true}

	function compositionEnd (e) {
		isComposing = false
		const data = e.dataTransfer || e.data
		editor.insertText(data)
	}

	/**
	 * beforeInput
	 */
	function beforeInput (e) {
		const { inputType } = e
		e.preventDefault()
		if (isComposing || !editor.range) return
		console.log(inputType, e.getTargetRanges())
		switch (inputType) {
			case 'insertText': {
				editor.insertText(e)
				break
			}
			case 'deleteContentBackward':
			case 'deleteWordBackward':
			case 'deleteSoftLineBackward': {
				editor.deleteBackward(e)
				break
			}
		}
		editor.getSelection()
	}

</script>
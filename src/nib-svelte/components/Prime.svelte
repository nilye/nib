	<div class="nib-prime"
	     data-path={path}
	     data-type={value.type}
	     data-nib-prime="true">
		<div class="nib-prime-ctrl" contenteditable="false">
			<div class="nib-sec-handle"></div>
			<Menu path={path} manifest={element}></Menu>
		</div>
		<div class="nib-prime-content">
			<svelte:component
				this={element.component}
				value={value}
				path={path}>
			</svelte:component>
		</div>
		<Insertion path={path}></Insertion>
	</div>

	<script>
		import { getContext } from 'svelte'
		import elements from '../element/manifest'
		import Insertion from './Insertion.svelte'
		import Menu from './Menu.svelte'

		export let value = {}
		export let path = []

		const editor = getContext('editor')
		let element = elements[value.type]
		let menu = {}

	</script>
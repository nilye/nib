<template>
	<div class="nib-container">
		<EditorComp></EditorComp>
	</div>
</template>

<script lang="ts">
	import { Editor } from '../../nib/core/editor'
	import EditorComp from './Editor.vue'

	export default {
		name: 'Nib',
		components: {
		  EditorComp
		},
		props:{
			initValue: {
				type: Array,
				default: []
			}
		},
		created(){
			this.$root.$editor = new Editor({
				initValue: this.initValue
			})
			console.log(this.$editor, this)
		}

	}
</script>
<template>
	<div class="nib-editor"
	     contenteditable="true"
	     autocapitalize="off"
	     autocomplete="off"
	     autocorrect="off"
	     spellcheck="false"
	     data-nib-editor="true">

	</div>
</template>

<script lang="ts">

  export default {
	    name: 'Editor',
	    created(): void {
	        console.log(this)
      }
  }
</script>
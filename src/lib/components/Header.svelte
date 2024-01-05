<script lang="ts">
	import { menu } from '$lib/shared/stores/componentStates.js'
	import { selectedChapter, black } from '$lib/shared/stores/selectedSlide.js'
	import Page from '../../routes/+page.svelte'
	import { bars, close } from '$lib/shared/svgs.js'
	const toggleMenu = () => menu.toggle()
</script>

<div class="header" class:black={$black}>
	<a href="#/" class:black={$black}><span class="hidden">The Berlage: </span>City Atlas</a>
	<div class="float link" on:click={toggleMenu} on:keypress={toggleMenu}>
		{#if $menu}{@html close}{:else}{@html bars}{/if}
	</div>
</div>

<style>
	.header {
		grid-column: 1 / 5;
		/* background-color: rgba(255, 255, 255, 0.8); */
		grid-row: header;
		padding: 15px;
		font-size: 1.2rem;
		/* border-bottom: 1px solid lightgrey; */
		z-index: 6;
		color: white;
	}
	.black {
		color: black;
	}
	.float {
		float: right;
	}
	.link {
		cursor: pointer;
	}
	.link:hover {
		color: rgba(255, 255, 114);
	}
	a {
		color: white;
		text-decoration: none;
	}
	a:hover {
		color: rgba(255, 255, 114);
		text-decoration: none;
	}
	@media all and (max-width: 600px) {
		.hidden {
			display: none;
		}
	}
</style>

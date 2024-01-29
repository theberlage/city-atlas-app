<script lang="ts">
	import { menu } from '$lib/shared/stores/componentStates.js'
	import { black } from '$lib/shared/stores/selectedSlide.js'
	import Page from '../../routes/+page.svelte'
	import { bars, close } from '$lib/shared/svgs.js'
	import { selectedChapter as chapter } from '$lib/shared/stores/selectedSlide.js'
	const toggleMenu = () => menu.toggle()
	const goHome = () => {
		menu.set(false)
		location.hash = `#/${$chapter}`
	}
</script>

<div class="header">
	<div>
		<button class:black={$black} class="home-button" on:click={goHome}>
			<body><span class="hidden">The Berlage: </span>City Atlas</body>
		</button>
	</div>
	<div class="menu">
		<button class:black={$black} class="menu-button" on:click={toggleMenu}>
			<body>
				{#if $menu}{@html close}{:else}{@html bars}{/if}
			</body>
		</button>
	</div>
</div>

<style>
	.header {
		grid-column: 1 / 5;
		/* background-color: rgba(255, 255, 255, 0.8); */
		grid-row: header;
		padding: 1rem;
		font-size: 1.2rem;
		/* border-bottom: 1px solid lightgrey; */
		z-index: 6;
		color: white;
		pointer-events: none;
	}

	button {
		background: none;
		pointer-events: auto;
		display: block;
		border: none;
		color: white;
		border-radius: 0.2rem;
		& svg {
			height: 1.5rem;
			width: 1.5rem;
		}
		&:hover {
			color: rgba(255, 255, 114);
			background: rgba(0, 0, 0, 0.2);
		}
		&:active {
			color: rgba(255, 255, 114);
		}
	}

	.menu-button {
		width: 2rem;
		height: 2rem;
		padding: 0;
		margin: 0;
		line-height: 0.4em;
	}

	.home-button {
		height: 2rem;
		padding: 0 0.25rem;
		& body {
			font-size: 1.2rem;
		}
	}

	.menu {
		width: 2rem;
		height: 2rem;
		position: absolute;
		right: 1rem;
		top: 1rem;
	}

	.black {
		color: black;
	}

	@media all and (max-width: 700px) {
		.hidden {
			display: none;
		}
	}
</style>

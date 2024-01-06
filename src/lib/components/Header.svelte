<script lang="ts">
	import { menu } from '$lib/shared/stores/componentStates.js'
	import { black } from '$lib/shared/stores/selectedSlide.js'
	import Page from '../../routes/+page.svelte'
	import { bars, close } from '$lib/shared/svgs.js'
	const toggleMenu = () => menu.toggle()
</script>

<div class="header">
	<div class="title">
		<a href="#/" class:black={$black}><span class="hidden">The Berlage: </span>City Atlas</a>
	</div>
	<div class:black={$black} class="menu">
		<button on:click={toggleMenu}>
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
	}
	.title {
		float: left;
	}
	.menu {
		width: 2rem;
		height: 2rem;
		position: absolute;
		right: 1rem;
		top: 1rem;
		& button {
			background: none;
			border: none;
			color: white;
			width: 100%;
			height: 100%;
			border-radius: 0.2rem;
			& svg {
				height: 1.5rem;
				width: 1.5rem;
			}
			&:hover {
				color: rgba(255, 255, 114);
			}
			&:active {
				color: rgba(255, 255, 114);
			}
		}
	}
	.black {
		color: black;
		& button {
			color: black;
		}
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

<script lang="ts">
	import { slideData } from '$lib/shared/stores/markdownSlides.js'
	import { menu } from '$lib/shared/stores/componentStates.js'
	import { fade } from 'svelte/transition'

	const toggleMenu = () => menu.toggle()
</script>

<div class="menu" transition:fade>
	<div class="body">
		<ul>
			{#each [...$slideData.keys()] as chapter}
				<li>
					<a on:click={toggleMenu} href="#/{chapter}"
						>{chapter.charAt(0).toUpperCase() + chapter.slice(1)}</a
					>
				</li>
				<ul>
					{#each [...$slideData.get(chapter).keys()].slice(1) as slideshow}
						<li>
							<a on:click={toggleMenu} href="#/{chapter}/{slideshow}/1"
								>{slideshow.charAt(0).toUpperCase() + slideshow.slice(1)}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</ul>
	</div>
</div>

<style>
	.menu {
		grid-column: 1 / 5;
		grid-row: 1 / 3;
		background-color: rgba(0, 0, 0, 0.6);
		padding-left: 20px;
		padding-right: 20px;
		padding-top: 3rem;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		z-index: 5;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 1.3;
		color: white;
	}
	a {
		color: white;
		text-decoration: none;
	}
	a:hover {
		color: rgba(255, 255, 114);
		text-decoration: none;
	}
	.body {
		font-size: 1.2rem;
		max-width: 600px;
		max-height: 100%;
	}
	ul {
		margin-left: 0;
		padding-left: 1em;
		padding-bottom: 1em;
		list-style-type: none;
	}
	@media all and (max-width: 800px) {
		.body {
			height: 100%;
		}
		.html {
			columns: 1;
		}
	}
</style>

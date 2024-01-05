<script lang="ts">
	import {
		selectedChapter as chapter,
		selectedSlideShow as slideshow,
		selectedSlideShowCount as count,
		selectedSlideIndex as index
	} from '$lib/shared/stores/selectedSlide.js'
	import { panel } from '$lib/shared/stores/componentStates.js'
	import { next, prev } from '$lib/shared/svgs.js'

	const togglePanel = () => panel.toggle()

	function goNext() {
		if ($index < $count - 1) {
			window.location.hash = `#/${$chapter}/${$slideshow}/${$index + 2}`
		} else if ($index === $count - 1) {
			window.location.hash = `#/${$chapter}/`
		}
	}

	function goPrev() {
		if ($index > 0) {
			window.location.hash = `#/${$chapter}/${$slideshow}/${$index}`
		} else if ($index === 0) {
			window.location.hash = `#/${$chapter}/`
		}
	}

	function goHome() {
		window.location.hash = '#/'
	}

	// up = 38
	// down = 40
	// right = 39
	// left = 37
	// esc = 27

	function onKeyDown(e: any) {
		switch (e.keyCode) {
			case 27:
				goHome()
				break
			case 37:
				goPrev()
				break
			case 39:
				goNext()
				break
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="control">
	<div class="grid-container">
		{#if $count > 1}
			<div class="flex-item prev button">
				<button on:click={() => goPrev()}>
					<body>{@html prev}</body>
				</button>
			</div>
			<div class="flex-item count">Slide {$index + 1} of {$count}</div>
			<div class="flex-item next button">
				<button on:click={() => goNext()}>
					<body>{@html next}</body>
				</button>
			</div>
		{:else}
			<div class="flex-item start">Click a location to start a slide show</div>
		{/if}
		<div class="flex-item link panel" on:click={togglePanel} on:keypress={togglePanel}>
			{#if $panel}Hide{:else}Show{/if} description
		</div>
	</div>
</div>

<style>
	.control {
		grid-column: 1 / 4;
		grid-row: 2 / 3;
		margin: 1rem auto;
		align-self: end;
		z-index: 4;
	}
	.grid-container {
		display: grid;
		grid-template-columns: [left] 3.2rem [center]1fr [right] 3.2rem;
		grid-template-rows: [top] 1fr [bottom] 1fr;
		font-size: 1.2rem;
		border-radius: 1rem;
		background-color: rgba(255, 255, 114);
		padding: 0.4rem;
		/* margin: 0 1rem; */
		height: 3.2rem;
		/* width: auto; */
		/* margin: auto; */
		/* display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center; */
	}

	.prev {
		grid-column: left;
		grid-row: 1 / 3;
	}

	.next {
		grid-column: right;
		grid-row: 1 / 3;
	}

	.button {
		& button {
			width: 100%;
			height: 100%;
			background: none;
			border: none;
			color: black;
		}
	}

	.count {
		grid-column: center;
		grid-row: top;
		text-align: center;
	}

	.panel {
		grid-column: center;
		grid-row: bottom;
		text-align: center;
	}

	.start {
		grid-column: 1 / 4;
		grid-row: top;
	}

	.flex-item {
		/* padding: 0rem 0.6rem; */
	}

	.link {
		cursor: pointer;
	}
	.link:hover {
	}

	@media all and (max-width: 600px) {
		.control {
			grid-column: 1 / 2;
			/* margin: 1rem; */
		}
	}
</style>

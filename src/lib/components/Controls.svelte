<script lang="ts">
	import {
		selectedChapter as chapter,
		selectedSlideShow as slideshow,
		selectedSlideShowCount as count,
		selectedSlideIndex as index,
		selectedSlideData as data,
		textColor,
		overview
	} from '$lib/shared/stores/selectedSlide.js'
	import { panel, menu, bear } from '$lib/shared/stores/componentStates.js'
	import { next, prev } from '$lib/shared/svgs.js'
	import { fly, slide as slideTransition, fade } from 'svelte/transition'

	$: title = $data?.frontmatter.meta.heading

	const togglePanel = () => panel.toggle()
	const toggleMenu = () => menu.toggle()
	const toggleBear = () => bear.toggle()

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
	// m = 77
	// b = 66

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
			case 77:
				toggleMenu()
				break
			case 80:
				togglePanel()
				break
			case 66:
				toggleBear()
				break
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class:control-panel={!$panel} class="control" style="--text-color: {$textColor}">
	<div class:overview-container={$overview} class="grid-container">
		{#if !$overview}
			<div class="grid-item prev button">
				<button on:click={() => goPrev()}>
					<body>{@html prev}</body>
				</button>
			</div>
			<div class="grid-item count">Slide {$index + 1} of {$count}</div>
			<div class="grid-item next button">
				<button on:click={() => goNext()}>
					<body>{@html next}</body>
				</button>
			</div>
		{:else}
			<div class="grid-item start">Select a location on the map</div>
		{/if}
		<div class:panel-overview={$overview} class="grid-item panel title">
			{title}
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
	.control-panel {
		grid-column: 1 / 6;
	}
	.grid-container {
		display: grid;
		grid-template-columns: [left] 4rem [center]1fr [right] 4rem;
		grid-template-rows: [top] 1fr [bottom] 1fr;
		border-radius: 1rem;
		background-color: rgba(255, 255, 255, 0.9);
		color: var(--text-color);
		height: 4rem;
		min-width: 300px;
	}
	.overview-container {
		grid-template-columns: [center]1fr;
		grid-template-rows: [top] 1fr [bottom] 1fr;
	}
	.prev {
		grid-column: left;
		grid-row: 1 / 3;
		& button {
			border-radius: 1rem 0 0 1rem;
		}
	}
	.next {
		grid-column: right;
		grid-row: 1 / 3;
		& button {
			border-radius: 0 1rem 1rem 0;
		}
	}
	.button {
		& button {
			width: 100%;
			height: 100%;
			background: none;
			border: none;
			color: var(--text-color);
			& svg {
				width: 1.5rem;
				height: 1.5rem;
			}
			&:hover {
				background: rgba(0, 0, 0, 0.2);
			}
			&:active {
				background: rgba(0, 0, 0, 0.2);
			}
		}
	}
	.count {
		grid-column: center;
		grid-row: bottom;
		text-align: center;
		margin: auto;
		/* padding-top: 0.4rem; */
	}
	.panel {
		font-size: 1.2rem;
		grid-column: center;
		grid-row: top;
		text-align: center;
		margin: auto;
	}
	.panel-overview {
		display: none;
	}
	.start {
		font-size: 1.2rem;
		grid-column: 1 / 4;
		grid-row: 1 /3;
		margin: auto;
		padding: 0 1rem;
	}
	@media all and (max-width: 700px) {
		.control {
			margin: 1rem;
		}
		.grid-container {
			background-color: rgba(255, 255, 255, 1);
		}
	}
</style>

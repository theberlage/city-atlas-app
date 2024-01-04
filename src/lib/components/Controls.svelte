<script lang="ts">
	import {
		selectedChapter as chapter,
		selectedSlideShow as slideshow,
		selectedSlideShowCount as count,
		selectedSlideIndex as index
	} from '$lib/shared/stores/selectedSlide.js'
	import { next, prev } from '$lib/shared/svgs.js'

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
	<div class="flex-container">
		{#if $count > 1}
			<div class="flex-item link" on:click={() => goPrev()} on:keypress={() => goPrev()}>
				{@html prev}
			</div>
			Slide {$index + 1} of {$count}
			<div class="flex-item link" on:click={() => goNext()} on:keypress={() => goNext()}>
				{@html next}
			</div>
		{:else}
			<div class="flex-item">Click a location to start a slide show</div>
		{/if}
	</div>
</div>

<style>
	.control {
		grid-column: 1 / 4;
		grid-row: 2 / 3;
		z-index: 2;
		margin: 1rem auto;
		align-self: end;
	}
	.flex-container {
		font-size: 1.2rem;
		border-radius: 1rem;
		background-color: rgba(255, 255, 114);
		padding: 0.4rem;
		margin: 0 1rem;
		/* width: auto; */
		/* margin: auto; */
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
	}

	.flex-item {
		padding: 0rem 0.6rem;
	}

	.link {
		cursor: pointer;
	}
	.link:hover {
	}

	@media all and (max-width: 600px) {
		.control {
			grid-column: 1 / 2;
			/* width: 100%; */
		}
	}
</style>

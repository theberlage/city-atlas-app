<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { slidesByProject, slideShowID, slideIndex } from '$lib/components/stores'

	const dispatch = createEventDispatcher()

	let slideCount: number
	let selectedSlide: any
	let hidden: boolean = false
	let annotations: any | undefined = undefined
	let xyz: any | undefined = undefined

	$: if ($slideShowID !== undefined) {
		slideCount = $slidesByProject[$slideShowID].length
		selectedSlide = $slidesByProject[$slideShowID][$slideIndex]
		if (selectedSlide.frontmatter.allmaps) {
			annotations = selectedSlide.frontmatter.allmaps
		} else {
			annotations = undefined
		}
		if (selectedSlide.frontmatter.xyz) {
			xyz = selectedSlide.frontmatter.xyz
		} else {
			xyz = undefined
		}
	}

	function goNext() {
		if ($slideIndex < slideCount - 1) {
			slideIndex.update((n) => n + 1)
		} else if ($slideIndex === slideCount - 1) {
			slideShowID.set(undefined)
			slideIndex.set(0)
		}
		dispatch('changeView')
	}

	function goPrev() {
		if ($slideIndex > 0) {
			slideIndex.update((n) => n - 1)
		} else if ($slideIndex === 0) {
			slideShowID.set(undefined)
			slideIndex.set(0)
		}
		dispatch('changeView')
	}

	function goHome() {
		slideShowID.set(undefined)
		slideIndex.set(0)
		dispatch('changeView')
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

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div class="panel panel-grid-container">
	<div class="description">
		<p class="project">
			{selectedSlide.frontmatter.meta.heading}
			<span class="float">{$slideIndex + 1}/{slideCount}</span>
		</p>
		<div class:hidden class="body">
			{@html selectedSlide.html}
			<ul>
				{#if annotations}
					{#each annotations as annotation}
						{#if annotation.label}
							<li>
								{annotation.label}
							</li>
						{/if}
					{/each}
				{/if}
				{#if xyz}
					{#if xyz.label}
						<li>
							{xyz.label}
						</li>
					{/if}
				{/if}
			</ul>
		</div>
	</div>
	<div class="control-container">
		<button class="control-item hideshow" on:click={() => (hidden = !hidden)}>
			{hidden === false ? 'Hide text' : 'Show text'}
		</button>
		<button class="control-item" on:click={goNext}>
			{$slideIndex === slideCount - 1 ? 'Back to overview' : 'Next slide'}
		</button>
		<button class="control-item" on:click={goPrev}>
			{$slideIndex === 0 ? 'Back to overview' : 'Previous slide'}
		</button>
	</div>
</div>

<style>
	.panel {
		background-color: rgba(255, 255, 255, 0.9);
		z-index: 2;
	}

	.panel-grid-container {
		grid-column: panel;
		grid-row: map;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr [controls] 100px;
		min-width: 0;
		min-height: 0;
		border-left: 1px solid lightgray;
	}

	:global(h1) {
		font-size: 1.3rem;
		font-weight: normal;
	}

	:global(h2) {
		font-size: 1.3rem;
		font-weight: normal;
	}

	:global(h3) {
		font-size: 1.3rem;
		font-weight: normal;
	}

	:global(strong) {
		font-weight: normal;
	}

	:global(em) {
		font-style: normal;
	}

	ul {
		font-size: 0.8rem;
	}

	ul > li {
		padding-bottom: 1rem;
	}

	.description {
		grid-column: 1 / 2;
		grid-row: 1 / 2;
		overflow: auto;
		z-index: 2;
		line-height: 1.3;
		padding-left: 20px;
		padding-right: 20px;
	}

	.hidden {
		display: none;
	}

	.body {
		hyphens: auto;
		text-align: justify;
		text-justify: inter-word;
	}

	.project {
		font-size: 0.8rem;
	}

	.control-container {
		grid-column: 1 / 2;
		grid-row: controls;
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: flex-start;
		z-index: 3;
		border-top: 1px solid lightgray;
	}

	.control-item {
		height: 50%;
		width: 100%;
		background-color: transparent;
		border: none;
		font-size: 1rem;
		color: blue;
	}

	.control-item:hover {
		background-color: lightgray;
	}

	.control-item:last-child {
		border-top: 1px solid lightgray;
	}

	.hideshow {
		display: none;
	}

	@media all and (max-width: 600px) {
		.panel {
			align-self: end;
			min-width: 0;
			min-height: 0;
			max-height: 80%;
		}
		.panel-grid-container {
			grid-template-rows: 1fr [controls] 100px;
			border-top: 1px solid lightgray;
			border-left: none;
		}
		.project {
			font-size: 1rem;
		}
		.control-container {
			flex-direction: row-reverse;
		}
		.control-item {
			height: 50%;
			width: 50%;
		}
		.control-item:last-child {
			border-right: 1px solid lightgray;
			border-top: none;
		}
		.control-item:first-child {
			border-bottom: 1px solid lightgray;
		}
		.hideshow {
			display: block;
			width: 100%;
			height: 50%;
		}
	}
</style>

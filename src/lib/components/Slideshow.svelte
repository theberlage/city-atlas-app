<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { slidesByProject, slideShowID, slideIndex } from '$lib/shared/slides'
	import { hexToRGBA } from '$lib/shared/styles'
	import { page } from '$app/stores'

	const dispatch = createEventDispatcher()

	let slideCount: number
	let selectedSlide: any
	let innerWidth: number
	$: hidden = innerWidth > 600 ? false : true
	let annotations: any | undefined = undefined
	let legend: any | undefined = undefined
	let xyz: any | undefined = undefined
	let allmapsViewer: string = 'https://viewer.allmaps.org/?url='

	$: if ($slideShowID !== undefined) {
		slideCount = $slidesByProject[$slideShowID].length
		selectedSlide = $slidesByProject[$slideShowID][$slideIndex]
		legend =
			selectedSlide.frontmatter.legend && selectedSlide.frontmatter.legend.length > 0
				? selectedSlide.frontmatter.legend
				: undefined
		annotations =
			selectedSlide.frontmatter.allmaps && selectedSlide.frontmatter.allmaps.length > 0
				? selectedSlide.frontmatter.allmaps
				: undefined
		xyz = selectedSlide.frontmatter.xyz?.url ? selectedSlide.frontmatter.xyz : undefined
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

<svelte:window bind:innerWidth on:keydown|preventDefault={onKeyDown} />

<div class="panel panel-grid-container">
	<div class="description">
		<p class="project">
			{selectedSlide.frontmatter.meta.heading}
			<span class="float">{$slideIndex + 1}/{slideCount}</span>
		</p>
		<div class:hidden class="body">
			{@html selectedSlide.html}
			{#if legend}
				<span class="sub-title">Legend</span>
				<dl class="legend">
					{#each legend as item}
						<dt>
							<div
								class="legend-item"
								style="background: {item.fill && item['fill-opacity']
									? $hexToRGBA(item.fill, item['fill-opacity'])
									: item.fill
									? item.fill
									: 'none'}; outline-color: {item.stroke && item['stroke-opacity']
									? $hexToRGBA(item.stroke, item['stroke-opacity'])
									: item.stroke
									? item.stroke
									: item.fill}"
							/>
						</dt>
						<dd>{item.label}</dd>
					{/each}
				</dl>
			{/if}
			{#if annotations || xyz}
				<span class="sub-title">Sources</span>
				<ul>
					{#if annotations}
						{#each annotations as annotation}
							{#if annotation.label}
								<li>
									{annotation.label}
									{#if annotation.attribution?.name && annotation.attribution?.url}
										<a href={annotation.attribution.url}>{annotation.attribution.name}</a>
									{/if}
									<a
										href={allmapsViewer +
											$page.url.href +
											selectedSlide.path +
											'annotations/' +
											annotation.annotation}>Open in Allmaps</a
									>
								</li>
							{/if}
						{/each}
					{/if}
					{#if xyz}
						{#if xyz.label}
							<li>
								{xyz.label}
								{#if xyz.attribution?.name && xyz.attribution?.url}
									<a href={xyz.attribution.url}>{xyz.attribution.name}</a>
								{/if}
							</li>
						{/if}
					{/if}
				</ul>
			{/if}
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

	ul > li > a {
		border-bottom: 1px solid black;
		color: black;
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

	.sub-title {
		text-transform: uppercase;
		font-size: 0.8rem;
	}

	dl.legend {
		font-size: 0.8rem;
		display: flex;
		flex-flow: row wrap;
	}

	dl.legend > dt {
		flex-basis: 10%;
		padding: 5px 0px;
		margin: 0;
	}

	dl.legend > dd {
		flex-basis: 90%;
		flex-grow: 1;
		margin: 0;
		padding: 5px 0px;
	}

	dl.legend::after {
		clear: left;
	}

	.legend-item {
		width: 12px;
		height: 12px;
		outline-width: 2px;
		outline-style: solid;
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

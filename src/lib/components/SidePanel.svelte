<script lang="ts">
	import {
		selectedSlideData as slide,
		selectedSlideShowCount as count,
		selectedSlideIndex as index
	} from '$lib/shared/stores/selectedSlide.js'
	import { hexToRGBA } from '$lib/shared/utils.js'
	import { page } from '$app/stores'
	import { fade } from 'svelte/transition'

	let data: any
	let path: string
	let html: string
	let annotations: any
	let legend: any
	let xyz: any
	let allmapsViewer: string = 'https://viewer.allmaps.org/?url='

	$: {
		if ($slide) {
			data = $slide.frontmatter
			html = $slide.html
			path = $slide.path
			legend = data.legend && data.legend.length > 0 ? data.legend : undefined
			annotations = data.allmaps && data.allmaps.length > 0 ? data.allmaps : undefined
			xyz = data.xyz?.url ? data.xyz : undefined
		}
	}
</script>

<svelte:window />

<div class="panel-grid-container" transition:fade>
	<div class="description">
		<p class="project">
			{data.meta.heading}
		</p>
		<div class="body">
			{@html html}
			{#if legend}
				<span class="sub-title">Legend</span>
				<dl class="legend">
					{#each legend as item}
						<dt>
							<div
								class="legend-item"
								style="background: {item.fill && item['fill-opacity']
									? hexToRGBA(item.fill, item['fill-opacity'])
									: item.fill
									? item.fill
									: 'none'}; outline-color: {item.stroke && item['stroke-opacity']
									? hexToRGBA(item.stroke, item['stroke-opacity'])
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
							{#if annotation.annotation && annotation.label}
								<li>
									{annotation.label}
									{#if annotation.attribution?.name && annotation.attribution?.url}
										<a href={annotation.attribution.url}>{annotation.attribution.name}</a>
									{/if}
									<a
										href={allmapsViewer +
											$page.url.origin +
											path +
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
</div>

<style>
	.panel-grid-container {
		background-color: rgba(255, 255, 114);
		z-index: 3;
		grid-column: panel;
		grid-row: map;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		min-width: 0;
		min-height: 0;
		border-radius: 1rem;
		margin: 0.4rem 1rem 1rem 0;
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
		grid-row: 1 / 3;
		overflow: auto;
		z-index: 2;
		line-height: 1.3;
		padding-left: 1rem;
		padding-right: 1rem;
	}
	.project {
		font-size: 0.8rem;
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
		.panel-grid-container {
			grid-template-rows: 1 / 3;
			border-radius: 1rem 1rem 0 0;
			margin: 0.4rem 0.4rem 0 0.4rem;
			background-color: white;
		}
		.body {
			padding-bottom: 5.2rem;
		}
		.project {
			font-size: 1rem;
		}
	}
</style>

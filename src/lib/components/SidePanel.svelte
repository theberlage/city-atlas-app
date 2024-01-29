<script lang="ts">
	import {
		selectedSlideData as slide,
		selectedSlideShowCount as count,
		selectedSlideIndex as index,
		textColor
	} from '$lib/shared/stores/selectedSlide.js'
	import { panel } from '$lib/shared/stores/componentStates.js'
	import { hexToRGBA } from '$lib/shared/utils.js'
	import { page } from '$app/stores'
	import { fly } from 'svelte/transition'

	let data: any
	let path: string
	let html: string
	let annotations: any
	let legend: any
	let xyz: any
	let allmapsViewer: string = 'https://viewer.allmaps.org/?url='
	let innerWidth: number
	let innerHeight: number
	$: flyX = innerWidth < 700 ? 0 : 400
	$: flyY = innerWidth < 700 ? innerHeight : 0

	$: if (innerWidth > 700) {
		panel.set(true)
	} else {
		panel.set(false)
	}

	const togglePanel = () => panel.toggle()

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

<svelte:window bind:innerWidth bind:innerHeight />

<div class="toggle" style="--text-color: {$textColor}" class:toggle-move={!$panel}>
	<button class="toggle-button" on:click={togglePanel}>
		<body>
			<svg
				class="toggle-svg"
				class:svg-move={!$panel}
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="m9 5 7 7-7 7"
				/>
			</svg>
		</body>
	</button>
</div>
{#if $slide && $panel}
	<div
		class="panel-grid-container"
		style="--text-color: {$textColor}"
		transition:fly={{ delay: 0, duration: 200, x: flyX, y: flyY, opacity: 0.5 }}
	>
		<div class="content">
			<div class="body">
				<!-- <p class="heading">
					{data.meta.heading}
				</p> -->
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
										: 'none'}; border-color: {item.stroke && item['stroke-opacity']
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
{/if}

<style>
	.toggle {
		grid-column: panel;
		grid-row: map;
		z-index: 4;
		width: 2.4rem;
		height: 5rem;
		margin: auto -2.4rem;
		border-radius: 1rem 0 0 1rem;
		background: rgba(255, 255, 255, 0.9);
	}
	.toggle-button {
		width: 100%;
		height: 100%;
		line-height: 0.4em;
		background: none;
		border: none;
		border-radius: 1rem 0 0 1rem;
		color: var(--text-color);
		& svg {
			width: 2rem;
			height: 2rem;
		}
		&:hover {
			background: rgba(0, 0, 0, 0.2);
		}
		&:active {
			background: rgba(0, 0, 0, 0.2);
		}
	}
	.toggle-move {
		justify-self: end;
		margin: auto 0rem;
	}
	.svg-move {
		transform: rotate(0.5turn);
	}
	.panel-grid-container {
		background-color: rgba(255, 255, 255, 0.9);
		color: var(--text-color);
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
		border-bottom: 1px solid var(--text-color);
		color: var(--text-color);
	}
	.content {
		grid-column: 1 / 2;
		grid-row: 1 / 3;
		overflow: auto;
		z-index: 2;
		line-height: 1.3;
		margin: 1rem 0rem;
	}
	.heading {
		font-size: 0.8rem;
		margin-top: 0px;
	}
	.body {
		margin: 0rem 1rem;
		& a {
			border-bottom: 1px solid var(--text-color);
			color: var(--text-color);
			&:hover {
				border-bottom: none;
			}
		}
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
		border-width: 2px;
		border-style: solid;
	}
	@media all and (max-width: 700px) {
		.panel-grid-container {
			border-radius: 1rem 1rem 0 0;
			margin: 0.4rem 1rem 4rem 1rem;
		}
		.toggle {
			align-self: start;
			margin: -2rem auto 0;
			height: 2.4rem;
			width: 5rem;
			border-radius: 1rem 1rem 0 0;
		}
		.toggle-button {
			border-radius: 1rem 1rem 0 0;
		}
		.toggle-svg {
			transform: rotate(0.25turn);
		}
		.toggle-move {
			align-self: end;
			margin: 0rem auto 5rem;
		}
		.svg-move {
			transform: rotate(0.75turn);
		}
	}
</style>

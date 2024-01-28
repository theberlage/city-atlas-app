<script lang="ts">
	import { slideData } from '$lib/shared/stores/markdownSlides.js'
	import { menu, bear } from '$lib/shared/stores/componentStates.js'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { marker2 } from '$lib/shared/svgs.js'

	const toggleMenu = () => menu.toggle()

	const svg = `<svg viewBox="0 0 543 670">
  <g transform="translate(-87.000000, -61.000000)" fill="rgb(239,202,221)" fill-rule="nonzero" id="group_artwork">
    <path d="M630,349.423392 L501.484742,349.423392 C552.059255,324.746502 586.903316,272.886945 586.903316,212.887083 C586.903316,129.002928 518.812625,61 434.817076,61 L130.647681,61 L130.647681,349.423392 L87,349.423392 L87,731 L630,731 L630,349.423392 Z M586,540.500769 C586,624.17226 517.798221,692 433.665636,692 L129,692 L129,389 L433.66409,389 C517.796675,389 586,456.829278 586,540.500769 Z" id="theberlage-logo"></path>
  </g>
</svg>
`
	// Eyeball animation https://codepen.io/GabEsu/pen/VdKjPE

	let eyeball: SVGCircleElement | undefined
	let pupil: SVGCircleElement | undefined
	let eyeRect: DOMRect | undefined
	let pupilRect: DOMRect | undefined
	let R: number | undefined
	let r: number | undefined
	let centerX: number | undefined
	let centerY: number | undefined
	let angle: number
	$: transform = `rotate(${angle}, 420, 200) translate(20)`

	function setPupil(event: MouseEvent) {
		if (eyeball && pupil) {
			const x = event.clientX - centerX
			const y = event.clientY - centerY
			const theta = Math.atan2(y, x)
			angle = (theta * 180) / Math.PI + 360
		}
	}

	$: {
		if (eyeball && pupil) {
			eyeRect = eyeball.getBoundingClientRect()
			pupilRect = pupil.getBoundingClientRect()
			R = eyeRect.width / 2
			r = pupilRect.width / 2
			centerX = eyeRect.left + R
			centerY = eyeRect.top + R
		}
	}

	onMount(() => {})
</script>

<svelte:window on:mousemove={(event) => setPupil(event)} />

<div class="menu" transition:fade>
	<div class="container">
		<div class="logo">
			<svg viewBox="0 0 544 671">
				<g fill="rgb(252,217,213)" fill-rule="nonzero" id="group_artwork">
					<path
						id="body"
						d="M347.2,288.9H415
        c50.6-24.7,85.4-76.5,85.4-136.5c0-83.9-68.1-151.9-152.1-151.9H44.1v288.4H0.5v381.6h346.7l0-39H42.5v-303h304.7V288.9z"
					/>
					<path
						id="lower-jaw"
						d="M499.5,480c0,83.7-68.2,151.5-152.3,151.5l0,39h196.3V479.7L499.5,480z"
						transform="rotate(10 348 480)"
					>
						<!-- https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform -->
						<!-- <animateTransform
							attributeName="transform"
							attributeType="XML"
							type="rotate"
							from="0 348 480"
							to="90 348 480"
							dur="1s"
							repeatCount="indefinite"
						/> -->
					</path>
					<path
						id="upper-jaw"
						d="M543.5,479.7V288.9H347.2v39.6c84.1,0,152.3,67.8,152.3,151.5L543.5,479.7z"
						transform="rotate(-5 348 480)"
					>
						<!-- <animateTransform
							attributeName="transform"
							attributeType="XML"
							type="rotate"
							from="0 348 480"
							to="-90 348 480"
							dur="1s"
							repeatCount="indefinite"
						/> -->
					</path>
				</g>
				{#if $bear}
					<g>
						<circle cx="420" cy="200" r="50" fill="white" class="eyeball" bind:this={eyeball} />
						<circle
							cx="420"
							cy="200"
							r="30"
							fill="#0D0D20"
							class="pupil"
							bind:this={pupil}
							{transform}
						/>
					</g>
				{/if}
			</svg>
		</div>
		<!-- <div class="animation">
			<svg width="100" height="100" class="eye" />
		</div> -->
		<div class="body">
			<ul>
				{#each [...$slideData.keys()] as chapter}
					<li>
						<a on:click={toggleMenu} href="#/{chapter}"
							>{chapter.charAt(0).toUpperCase() + chapter.slice(1)}</a
						>
					</li>
					<!-- <ul>
						{#each [...$slideData.get(chapter).keys()].slice(1) as slideshow}
							<li>
								<a on:click={toggleMenu} href="#/{chapter}/{slideshow}/1"
									>{slideshow.charAt(0).toUpperCase() + slideshow.slice(1)}</a
								>
							</li>
						{/each}
					</ul> -->
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
	.menu {
		grid-column: 1 / 5;
		grid-row: 1 / 3;
		background-color: rgba(0, 0, 0, 0.6);
		padding: 3rem 1rem 1rem 1rem;
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
	.container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		width: 100%;
		height: 100%;
	}
	a {
		color: white;
		text-decoration: none;
	}
	a:hover {
		color: rgba(255, 255, 114);
		text-decoration: none;
	}
	.logo {
		grid-column: 1 / 2;
		grid-row: 1 / 3;
		margin: auto;
		width: 80%;
		height: 80%;
		& svg {
			width: 100%;
			height: 100%;
		}
	}
	.logo {
		grid-column: 1 / 2;
		grid-row: 1 / 3;
	}
	.pupil {
		position: relative;
		/*   transform:  rotate(390deg); */
		/*   transform-origin: 20px center; */
	}
	.body {
		grid-column: 2 / 3;
		grid-row: 1 / 3;
		font-size: 1.2rem;
		max-width: 700px;
		max-height: 100%;
	}
	ul {
		margin-left: 0;
		padding-left: 1em;
		padding-bottom: 1em;
		list-style-type: none;
	}
	@media all and (max-width: 700px) {
		.body {
			height: 100%;
		}
		.html {
			columns: 1;
		}
	}
</style>

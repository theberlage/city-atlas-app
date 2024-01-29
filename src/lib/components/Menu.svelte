<script lang="ts">
	import { slideData } from '$lib/shared/stores/markdownSlides.js'
	import { menu, bear } from '$lib/shared/stores/componentStates.js'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'

	const toggleMenu = () => menu.toggle()

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
	$: transform = `rotate(${angle ? angle : 0}, 114, 64) translate(4)`

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
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 235">
				<g fill="rgb(252,217,213)" fill-rule="nonzero" id="group_artwork">
					<path
						id="body"
						d="M137.8,108c15.6-8.5,26.2-25,26.2-44c0-27.6-22.4-50-50-50H14v94H0v127h180V108H137.8z M114,221H14V121h100
        c27.6,0,50,22.4,50,50S141.6,221,114,221z"
					/>
				</g>
				<g stroke="rgb(119, 63, 63)" fill="none" stroke-width="6">
					<circle
						class="circle-transform"
						cx="127"
						cy="64"
						r="27"
						stroke-dasharray="4.71238898038469"
						stroke-dashoffset="4.71238898038469"
					/>
					<circle
						class="circle-transform"
						cx="127"
						cy="64"
						r="21"
						stroke-dasharray="3.6651914291880923"
						stroke-dashoffset="0"
					/>
					<circle
						class="circle-transform"
						cx="127"
						cy="64"
						r="15"
						stroke-dasharray="2.617993877991494"
						stroke-dashoffset="2.617993877991494"
					/>
					<circle
						class="circle-transform"
						cx="127"
						cy="64"
						r="9"
						stroke-dasharray="1.5707963267948966"
						stroke-dashoffset="0"
						stroke-width="6"
					/>
					<circle
						class="circle-transform"
						cx="127"
						cy="64"
						r="3"
						stroke-dasharray="0.5235987755982988"
						stroke-dashoffset="0.5235987755982988"
					/>
				</g>
				{#if $bear}
					<g>
						<circle cx="114" cy="64" r="10" fill="white" class="eyeball" bind:this={eyeball} />
						<circle
							cx="185"
							cy="64"
							r="6"
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
		margin-top: 0;
		/* width: 100%; */
		height: 95%;
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
		margin: auto;
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

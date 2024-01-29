<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	// Stores
	import { menu, panel } from '$lib/shared/stores/componentStates.js'
	import { hash } from '$lib/shared/stores/hashRouter.js'
	import { selectedSlideData as data } from '$lib/shared/stores/selectedSlide.js'

	// Components
	import Header from '$lib/components/Header.svelte'
	import Menu from '$lib/components/Menu.svelte'
	import Map from '$lib/components/Map.svelte'
	import Controls from '$lib/components/Controls.svelte'
	import SidePanel from '$lib/components/SidePanel.svelte'

	let innerHeight: number
	let innerWidth: number

	// $: if (innerWidth > 700) {
	// 	panel.set(true)
	// } else {
	// 	panel.set(false)
	// }

	onMount(async () => {
		hash.set(location.hash)
	})
</script>

<svelte:window bind:innerHeight bind:innerWidth on:hashchange={() => hash.set(location.hash)} />

<svelte:head>
	<title>City Atlas</title>
</svelte:head>

<div class="grid-container" style="height:{innerHeight}px;">
	<Header />
	{#if $menu}
		<Menu />
	{/if}
	<Map />
	{#if $data}
		<Controls />
	{/if}
	<SidePanel />
</div>

<style>
	@import '../app.css';

	/* Todo: fix notch on iOS https://css-tricks.com/the-notch-and-css/ */

	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr [panel] 400px;
		grid-template-rows: [header] 3rem [map] 1fr;
		width: 100vw;
		height: 100vh;
	}
	@media all and (max-width: 700px) {
		.grid-container {
			display: grid;
			grid-template-columns: [panel] 1fr;
			grid-template-rows: [header] 3rem [map] 1fr;
			width: 100vw;
			height: 100vh;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte'
	import { derived } from 'svelte/store'
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

	$: if (innerWidth > 600) {
		panel.set(true)
	} else {
		panel.set(false)
	}

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
	<Controls />
	{#if $data && $panel}
		<SidePanel />
	{/if}
</div>

<style>
	@import '../app.css';

	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr [panel] 400px;
		grid-template-rows: [header] 3rem [map] 1fr;
		width: 100vw;
		height: 100vh;
		/* gap: 1rem; */
		/* position: absolute;
    left: 0;
    top: 0; */
	}

	.grey {
		color: grey;
	}

	.full {
		grid-column: 1 / 5;
	}

	.part {
		grid-column: 1 / 4;
	}

	@media all and (max-width: 600px) {
		.grid-container {
			display: grid;
			grid-template-columns: [panel] 1fr;
			grid-template-rows: [header] 3rem [map] 1fr;
			width: 100vw;
			height: 100vh;
		}
	}
</style>

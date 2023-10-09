<script lang="ts">
	// JS and Svelte functions

	import { onMount } from 'svelte'

	// OpenLayers

	import Map from 'ol/Map'
	import View from 'ol/View'
	import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js'
	import 'ol/ol.css'
	import { fromLonLat } from 'ol/proj.js'
	import ZoomToExtent from 'ol/control/ZoomToExtent.js'
	import { getCenter } from 'ol/extent'
	import GeoJSON from 'ol/format/GeoJSON.js'
	import * as Color from 'ol/color.js'
	import { OSM, XYZ, Vector as VectorSource } from 'ol/source.js'
	import { Fill, Stroke, Circle, Style } from 'ol/style.js'
	import EsriJSON from 'ol/format/EsriJSON.js'
	import Select from 'ol/interaction/Select.js'
	import { VectorSourceEvent } from 'ol/source/Vector'
	import { MapboxVectorLayer } from 'ol-mapbox-style'

	// Stores

	import { slidesByProject, slideShowID, slideIndex, homePage } from '$lib/components/stores'

	// Allmaps

	import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

	// Typescript

	import type { FeatureLike } from 'ol/Feature.js'
	import type { Coordinate } from 'ol/coordinate'
	import type { Extent } from 'ol/extent'
	import type { GeoJSONGeometryCollection } from 'ol/format/GeoJSON'

	// Components

	import Slideshow from '$lib/components/Slideshow.svelte'
	import About from '$lib/components/About.svelte'
	import Bearlage from '$lib/components/Bearlage.svelte'

	// Declaring changing variables with let and fixed ones with const

	let map: Map
	let view: View

	let warpedMapSource: WarpedMapSource
	let warpedMapLayer: WarpedMapLayer
	let vectorSource: VectorSource
	let vectorLayer: VectorLayer<VectorSource>
	let xyzSource: XYZ
	let xyzLayer: TileLayer<XYZ>

	let slideCount: number
	let selectedSlide: any = undefined
	let selectedFeature: FeatureLike | undefined

	let innerHeight: number
	let about: boolean = false

	// Styles for OpenLayers

	const styles = new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'rgba(255, 255, 255, 0)'
		})
	})

	const selected = new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'yellow'
		}),
		zIndex: 5
	})

	const selectable = new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'rgba(0, 255, 255, 0)'
		}),
		zIndex: 4
	})

	// Function to fetch external jsons

	async function fetchJson(url: string) {
		return fetch(url).then((response) => response.json())
	}

	// Function to add vector layer

	async function addVectorSource(geojsonsPaths: Array<string>) {
		let geojsons = await Promise.all(geojsonsPaths.map(fetchJson))
		let extent: Extent

		for (let geojson of geojsons) {
			let features = new GeoJSON().readFeatures(geojson, {
				featureProjection: 'EPSG:3857'
			})
			vectorSource.addFeatures(features)
		}

		vectorSource.forEachFeature(function (feature) {
			let properties = feature.getProperties()

			let fillColor = properties['fill'] ? Color.asArray(properties.fill) : 'yellow'

			if (properties['fill-opacity']) {
				fillColor[3] = properties['fill-opacity']
			}

			let strokeColor = properties['stroke'] ? Color.asArray(properties.stroke) : 'yellow'

			if (properties['stroke-opacity']) {
				strokeColor[3] = properties['stroke-opacity']
			}

			let strokeWidth = properties['stroke-width'] ? properties['stroke-width'] : 4
			let radius = properties.radius ? properties.radius : 10

			let customStyle = new Style({
				stroke: new Stroke({
					color: strokeColor,
					width: strokeWidth
				}),
				fill: new Fill({
					color: fillColor
				}),
				image: new Circle({
					radius,
					fill: new Fill({ color: fillColor }),
					stroke: new Stroke({
						color: strokeColor,
						width: strokeWidth
					})
				})
			})

			feature.setStyle(customStyle)

			if (properties.project) {
				feature.setStyle(selectable)
			}
		})
	}

	// Function to add Allmaps layer

	async function addWarpedMapSource(annotations: any) {
		for (let annotation of annotations) {
			let response = await fetchJson(annotation.path)
			let id = await warpedMapSource.addGeoreferenceAnnotation(response).then((resp) => resp[0])
			if (annotation.opacity) {
				let opacity = annotation.opacity / 100
				warpedMapLayer.setMapOpacity(id, opacity)
			}
			if (annotation.removeBackground && annotation.removeBackground.color) {
				let hexColor = annotation.removeBackground.color
				let threshold = annotation.removeBackground.threshold
					? annotation.removeBackground.threshold / 100
					: 0.1
				let hardness = annotation.removeBackground.hardness
					? annotation.removeBackground.hardness / 100
					: 0.1
				warpedMapLayer.setMapRemoveBackground(id, { hexColor, threshold, hardness })
			}
			if (annotation.colorize) {
				warpedMapLayer.setMapColorize(id, annotation.colorize)
			}
		}
	}

	function calculateExtent(boundingBox: Coordinate) {
		return fromLonLat(boundingBox.slice(0, 2)).concat(fromLonLat(boundingBox.slice(2)))
	}

	// Function to animate view

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	async function animateView(extent: Extent, rotation: number, duration: number = 1000) {
		let center = getCenter(extent)
		let resolution = view.getResolutionForExtent(extent, map.getSize())

		view.animate({
			center: center,
			resolution: resolution,
			rotation: rotation
		})
		// await sleep(duration)
	}

	// Function to change layers and view depending on state

	async function changeView() {
		let rotation: number = 0
		let extent: Extent | undefined = undefined
		let geojsons: Array<string>
		let xyz: string
		let annotations: Array<String>
		let slide = $slideShowID
		let index = $slideIndex
		let path: string

		warpedMapSource.clear()
		vectorSource.clear()
		xyzSource.setUrl('')
		xyzSource.clear()

		if (slide !== undefined) {
			selectedSlide = $slidesByProject[slide][index]
			slideCount = $slidesByProject[slide].length
			extent = calculateExtent(selectedSlide.frontmatter.viewer.bbox)
			rotation = selectedSlide.frontmatter.viewer.rotation * (Math.PI / 180)
			path = '/projects/' + $slideShowID
		} else if (slide === undefined) {
			selectedSlide = $homePage
			extent = calculateExtent(selectedSlide.frontmatter.viewer.bbox)
			rotation = selectedSlide.frontmatter.viewer.rotation * (Math.PI / 180)
			path = '/overview'
			await animateView(extent, rotation)
		}

		await animateView(extent, rotation)

		if (selectedSlide.frontmatter.allmaps && selectedSlide.frontmatter.allmaps.length > 0) {
			annotations = selectedSlide.frontmatter.allmaps.map((item: any) => {
				return { path: path + '/annotations/' + item.annotation, ...item }
			})
			addWarpedMapSource(annotations.reverse())
		}

		if (selectedSlide.frontmatter.geojson && selectedSlide.frontmatter.geojson.length > 0) {
			geojsons = selectedSlide.frontmatter.geojson.map((item: any) => {
				return path + '/geojsons/' + item.filename
			})
			addVectorSource(geojsons.reverse())
		}

		if (selectedSlide.frontmatter.xyz && selectedSlide.frontmatter.xyz.url) {
			xyz = selectedSlide.frontmatter.xyz.url
			xyzSource.setUrl(xyz)
		}
	}

	// onMount function after components are loaded, see https://svelte.dev/tutorial/onmount

	onMount(async () => {
		// Initialising OpenLayers

		view = new View({
			// center: initialViewCoords,
			// zoom: 8
		})

		vectorSource = new VectorSource()
		vectorLayer = new VectorLayer({
			source: vectorSource,
			style: styles,
			zIndex: 3
		})

		warpedMapSource = new WarpedMapSource()
		warpedMapLayer = new WarpedMapLayer({
			source: warpedMapSource,
			zIndex: 2
		})

		xyzSource = new XYZ({
			url: 'https://images.huygens.knaw.nl/webmapper/maps/pw-1985/{z}/{x}/{y}.png'
		})

		xyzLayer = new TileLayer({
			source: xyzSource,
			zIndex: 1
		})

		// let mapBoxLayer = new MapboxVectorLayer({
		// 	styleUrl: 'mapbox://styles/eliottmoreau/cld2u07au002k01ql8ku1gx29',
		// 	accessToken:
		// 		'pk.eyJ1IjoiZWxpb3R0bW9yZWF1IiwiYSI6ImNsY3N0bWUwcDBlNXYzd3MxaGptMDlyeXgifQ.pXVx5GYbNMBGYDNY_gQZVg'
		// })

		// let esriLayer = new TileLayer({
		// 	source: new XYZ({
		// 		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		// 		attribution:
		// 			'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
		// 	})
		// })

		// let osmLayer = new TileLayer({
		// 	source: new OSM(),
		// 	zIndex: 1
		// })

		map = new Map({
			view,
			layers: [
				xyzLayer,
				// esriLayer,
				// osmLayer,
				// mapBoxLayer,
				warpedMapLayer,
				vectorLayer
			],
			target: 'ol',
			controls: []
		})

		changeView()

		// if ($page.url.searchParams.has('project')) {
		//   let project: string = $page.url.searchParams.get('project')
		//   if ($slidesByProject[project]) {
		//     slideShowID.set(project)
		//     let slide: number = $page.url.searchParams.get('slide')
		//     let slideCount = $slidesByProject[$slideShowID].length
		//     if (slide >= 0 && slide <= slideCount) {
		//       slideIndex.set(slide)
		//     }
		//     changeView()
		//   }
		// }

		map.on('pointermove', function (event) {
			vectorLayer.getFeatures(event.pixel).then(function (features) {
				let feature = features.length ? features[0] : undefined
				if (feature == undefined || !feature.getProperties().project) {
					vectorSource.forEachFeature(function (feature) {
						let properties = feature.getProperties()
						if (properties.project) {
							feature.setStyle(selectable)
						}
					})
					map.getTargetElement().style.cursor = ''
				}
				if (feature !== undefined && feature.getProperties().project) {
					feature.setStyle(selected)
					map.getTargetElement().style.cursor = 'pointer'
				}
			})
		})

		map.on('singleclick', function (event) {
			vectorLayer.getFeatures(event.pixel).then(function (features) {
				const feature = features.length ? features[0] : undefined
				if (feature !== undefined) {
					const properties = feature.getProperties()
					if (properties.project) {
						slideShowID.set(properties.project)
						changeView()
					}
				}
			})
		})
	})

	function goHome() {
		slideShowID.set(undefined)
		slideIndex.set(0)
		about = false
		changeView()
	}

	let bear: boolean = false

	function onKeyDown(e: any) {
		switch (e.keyCode) {
			case 66:
				bear = true
		}
	}

	function onKeyUp(e: any) {
		switch (e.keyCode) {
			case 66:
				bear = false
		}
	}
</script>

<svelte:window bind:innerHeight on:keydown={onKeyDown} on:keyup={onKeyUp} />

<svelte:head>
	<title>City Atlas</title>
</svelte:head>

<div class="grid-container" style="height:{innerHeight}px;">
	<div class="header">
		<span class="link" on:click={() => goHome()} on:keypress={() => goHome()}>
			<span class="hidden">The Berlage: </span>City Atlas</span
		>
		{#if $slideShowID === undefined}
			<span
				class="float link"
				on:click={() => (about = !about)}
				on:keypress={() => (about = !about)}
			>
				{about === false ? 'About' : 'Back to overview'}
			</span>
		{:else}
			<span class="float grey">About</span>
		{/if}
	</div>
	{#if about}
		<About />
	{/if}
	{#if $slideShowID !== undefined}
		<Slideshow on:changeView={changeView} />
	{/if}
	{#if bear}
		<Bearlage />
	{/if}
	<div id="ol" class="map" />
</div>

<style>
	:global(@font-face) {
		font-family: 'ZurichBT';
		src: url('$lib/fonts/ZurichBT-Regular.woff') format('woff');
		font-weight: normal;
		font-stretch: normal;
		font-style: normal;
	}

	:global(html),
	:global(body) {
		font-family: ZurichBT, Helvetica Neue, Helvetica, Arial, sans-serif;
		font-size: 15px;
		padding: 0;
		margin: 0;
	}

	:global(.float) {
		float: right;
	}

	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr [panel] 400px;
		grid-template-rows: [header] 42px [map] 1fr;
		width: 100vw;
		height: 100vh;
	}

	@media all and (max-width: 600px) {
		.grid-container {
			display: grid;
			grid-template-columns: [panel] 1fr;
			grid-template-rows: [header] 40px [map] 1fr;
			width: 100vw;
			height: 100vh;
		}
		.hidden {
			display: none;
		}
	}

	.header {
		grid-column: 1 / 5;
		grid-row: header;
		padding: 10px;
		font-size: 1.2rem;
		border-bottom: 1px solid lightgrey;
	}

	.link {
		cursor: pointer;
	}

	.grey {
		color: grey;
	}

	.map {
		grid-column: 1 / 5;
		grid-row: map;
		background-color: white;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>

<script lang="ts">
	// JS and Svelte functions

	import { onMount } from 'svelte'

	// OpenLayers

	import Map from 'ol/Map'
	import View from 'ol/View'
	import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js'
	import 'ol/ol.css'
	import { fromLonLat } from 'ol/proj.js'
	import { Rotate, defaults as defaultControls } from 'ol/control.js'
	import { getCenter } from 'ol/extent'
	import GeoJSON from 'ol/format/GeoJSON.js'
	import * as Color from 'ol/color.js'
	import { OSM, XYZ, Vector as VectorSource } from 'ol/source.js'
	import { Fill, Stroke, Circle, Style } from 'ol/style.js'
	import EsriJSON from 'ol/format/EsriJSON.js'
	import Select from 'ol/interaction/Select.js'
	import { VectorSourceEvent } from 'ol/source/Vector'
	import { MapboxVectorLayer } from 'ol-mapbox-style'
	import { fromExtent } from 'ol/geom/Polygon'
	import Feature from 'ol/Feature.js'

	// Stores

	import { slidesByProject, slideShowID, slideIndex, homePage } from '$lib/shared/slides.js'
	import { hexToRGBA, defaultStyles, selectableStyles, selectedStyles } from '$lib/shared/styles.js'

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
	let innerWidth: number
	let about: boolean = false

	// Function to fetch external jsons

	async function fetchJson(url: string) {
		return fetch(url).then((response) => response.json())
	}

	// Function to add vector layer

	async function addVectorSource(geojsonsPaths: Array<string>) {
		let geojsons = await Promise.all(geojsonsPaths.map(fetchJson))

		for (let geojson of geojsons) {
			let features = new GeoJSON().readFeatures(geojson, {
				featureProjection: 'EPSG:3857'
			})
			vectorSource.addFeatures(features)
		}

		vectorSource.forEachFeature(function (feature) {
			let properties = feature.getProperties()

			let fillOpacity = 'fill-opacity' in properties ? properties['fill-opacity'] : 0
			let strokeOpacity = 'stroke-opacity' in properties ? properties['stroke-opacity'] : 1

			let fillColor =
				properties.fill && properties.fill.includes('rgba')
					? properties.fill
					: properties.fill && properties.fill.includes('#')
					? $hexToRGBA(properties.fill, fillOpacity)
					: `rgba(255, 255, 0, ${fillOpacity})`

			let strokeColor =
				properties.stroke && properties.stroke.includes('rgba')
					? properties.stroke
					: properties.stroke && properties.stroke.includes('#')
					? $hexToRGBA(properties.stroke, strokeOpacity)
					: `rgba(255, 255, 0, ${strokeOpacity})`

			let strokeWidth = 'stroke-width' in properties ? properties['stroke-width'] : 2
			let radius = 'radius' in properties ? properties.radius : 10

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
				feature.setStyle($selectableStyles)
			}
		})
	}

	// Function to add Allmaps layer

	async function addWarpedMapSource(annotations: any) {
		for (let annotation of annotations) {
			let response = await fetchJson(annotation.path)
			let id = await warpedMapSource.addGeoreferenceAnnotation(response).then((resp) => resp[0])
			if ('opacity' in annotation) {
				let opacity = annotation.opacity / 100
				warpedMapLayer.setMapOpacity(id, opacity)
			}
			if (annotation.removeBackground?.color) {
				let properties = annotation.removeBackground
				let hexColor = properties.color
				let threshold = 'threshold' in properties ? properties.threshold / 100 : 0.1
				let hardness = 'hardness' in properties ? properties.hardness / 100 : 0.7
				warpedMapLayer.setMapRemoveBackground(id, { hexColor, threshold, hardness })
			}
			if ('saturation' in annotation) {
				warpedMapLayer.setMapSaturation(id, annotation.saturation / 100)
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

		// let bboxPolygon = fromExtent(extent)
		// let bboxFeature = new Feature({
		// 	geometry: bboxPolygon
		// })

		// vectorSource.addFeature(bboxFeature)

		view.animate({
			center,
			resolution,
			rotation
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
			view.padding = innerWidth > 600 ? [0, 400, 0, 0] : [0, 0, 0, 0]
			selectedSlide = $slidesByProject[slide][index]
			slideCount = $slidesByProject[slide].length
			path = '/projects/' + $slideShowID
		} else if (slide === undefined) {
			view.padding = [0, 0, 0, 0]
			selectedSlide = $homePage
			path = '/overview'
		}

		extent = calculateExtent(selectedSlide.frontmatter.viewer.bbox)
		rotation = selectedSlide.frontmatter.viewer.rotation * (Math.PI / 180)
		await animateView(extent, rotation)

		if (selectedSlide.frontmatter.allmaps && selectedSlide.frontmatter.allmaps.length > 0) {
			annotations = selectedSlide.frontmatter.allmaps
				.filter((item: any) => item.annotation)
				.map((item: any) => {
					return { path: path + '/annotations/' + item.annotation, ...item }
				})
			addWarpedMapSource(annotations.reverse())
		}

		if (selectedSlide.frontmatter.geojson && selectedSlide.frontmatter.geojson.length > 0) {
			geojsons = selectedSlide.frontmatter.geojson
				.filter((item: any) => item.filename)
				.map((item: any) => {
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
			style: $defaultStyles,
			zIndex: 3
		})

		warpedMapSource = new WarpedMapSource()
		warpedMapLayer = new WarpedMapLayer({
			source: warpedMapSource,
			zIndex: 2
		})

		xyzSource = new XYZ()
		xyzLayer = new TileLayer({
			source: xyzSource,
			zIndex: 1
		})

		let mapBoxLayer = new MapboxVectorLayer({
			styleUrl: $homePage.frontmatter.mapbox.styleUrl,
			accessToken: $homePage.frontmatter.mapbox.accessToken
		})

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
				mapBoxLayer,
				warpedMapLayer,
				vectorLayer
			],
			target: 'ol',
			controls: defaultControls().extend([new Rotate()])
		})

		changeView()

		map.on('pointermove', function (event) {
			vectorLayer.getFeatures(event.pixel).then(function (features) {
				let feature = features.length ? features[0] : undefined
				if (feature == undefined || !feature.getProperties().project) {
					vectorSource.forEachFeature(function (feature) {
						let properties = feature.getProperties()
						if (properties.project) {
							feature.setStyle($selectableStyles)
						}
					})
					map.getTargetElement().style.cursor = ''
				}
				if (feature !== undefined && feature.getProperties().project) {
					feature.setStyle($selectedStyles)
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
						window.location.hash = '#/project/' + properties.project + '/1'
					}
				}
			})
		})
	})

	function goHome() {
		window.location.hash = '#/'
	}

	function goAbout() {
		if (about) {
			window.location.hash = '#/'
		} else {
			window.location.hash = '#/about'
		}
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

	function routeChange() {
		const hashArray = location.hash.split('/')
		if (hashArray.length >= 1) {
			if (hashArray[1] === 'project' && $slidesByProject[hashArray[2]]) {
				const index =
					hashArray[3] &&
					+hashArray[3] <= $slidesByProject[hashArray[2]].length &&
					+hashArray[3] > 0
						? +hashArray[3] - 1
						: 0
				slideShowID.set(hashArray[2])
				slideIndex.set(index)
			} else if (hashArray[1] === 'about') {
				slideShowID.set(undefined)
				slideIndex.set(0)
				about = true
			} else {
				slideShowID.set(undefined)
				slideIndex.set(0)
				about = false
			}
		}
		changeView()
	}
</script>

<svelte:window
	bind:innerHeight
	bind:innerWidth
	on:keydown={onKeyDown}
	on:keyup={onKeyUp}
	on:hashchange={routeChange}
/>

<svelte:head>
	<title>City Atlas</title>
</svelte:head>

<div class="grid-container" style="height:{innerHeight}px;">
	<div class="header">
		<span class="link" on:click={() => goHome()} on:keypress={() => goHome()}>
			<span class="hidden">The Berlage: </span>City Atlas</span
		>
		{#if $slideShowID === undefined}
			<span class="float link" on:click={() => goAbout()} on:keypress={() => goAbout()}>
				{about === false ? 'About' : 'Back to overview'}
			</span>
		{/if}
	</div>
	{#if about}
		<About />
	{/if}
	{#if $slideShowID !== undefined}
		<Slideshow />
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

	:global(.ol-rotate) {
		left: 0.5em;
		top: 4em;
		right: auto;
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
			grid-template-rows: [header] 40px [map] 1fr;
			width: 100vw;
			height: 100vh;
		}
		.hidden {
			display: none;
		}
		:global(.ol-rotate) {
			left: auto;
			right: 0.5em;
			top: 0.5em;
		}
	}
</style>

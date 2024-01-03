import { readable, writable, derived, get } from 'svelte/store'
import { slideData } from '$lib/shared/stores/markdownSlides.js'
import { fetchJson } from '$lib/shared/utils.js'

export let selectedChapter = writable<string | undefined>(undefined)
export let selectedSlideShow = writable<string | undefined>(undefined)
export let selectedSlideIndex = writable<number>(0)

selectedChapter.subscribe((value) => {
	console.log('selectedChapter', value)
})

selectedSlideShow.subscribe((value) => {
	console.log('selectedSlideShow', value)
})

selectedSlideIndex.subscribe((value) => {
	console.log('selectedSlideIndex', value)
})

const selectedChapterData = derived(
	[slideData, selectedChapter],
	([$slideData, $selectedChapter], set) => {
		if ($selectedChapter) {
			set($slideData.get($selectedChapter))
		}
	}
)

const selectedSlideShowData = derived(
	[selectedChapterData, selectedSlideShow],
	([$selectedChapterData, $selectedSlideShow], set) => {
		if ($selectedChapterData) {
			set($selectedChapterData.get($selectedSlideShow))
		}
	}
)

export const selectedSlideShowCount = derived(
	selectedSlideShowData,
	($selectedSlideShowData, set) => {
		if ($selectedSlideShowData) set($selectedSlideShowData.length)
	}
)

// Data for the current slide
// First value is undefined
export const selectedSlideData = derived(
	[selectedSlideShowData, selectedSlideIndex],
	([$selectedSlideShowData, $selectedSlideIndex], set) => {
		// First value of selectedChapter is undefined
		if ($selectedSlideShowData) {
			set($selectedSlideShowData[$selectedSlideIndex])
		}
	}
)

// Fetch georeference annotations of selected slide
// Initial value is undefined
// https://www.reddit.com/r/sveltejs/comments/tetq8w/what_is_a_good_practise_for_fetching_data_and/
// https://svelte.dev/docs/svelte-store#derived
export const georefAnnotations = derived(selectedSlideData, ($selectedSlideData, set) => {
	if ($selectedSlideData && $selectedSlideData.frontmatter?.allmaps?.length) {
		const resp = $selectedSlideData.frontmatter?.allmaps
			// Remove items without annotation filename
			.filter((item) => item.annotation)
			// Reverse array to make sure layers are added in the right order
			.reverse()
			// Create an array of promises to fetch the jsons while keeping the metadata
			.map((item) => {
				const path = $selectedSlideData.path + 'annotations/' + item.annotation
				return fetchJson(path).then((resp) => ({ ...item, resp }))
			})
		// Map of individual annotations (that can be used to check for existing maps)
		Promise.all(resp).then((data) => {
			const map = new Map()
			for (const item of data) {
				for (const annotation of item.resp.items) {
					annotation.properties = {
						opacity: item.opacity,
						saturation: item.saturation,
						colorize: item.colorize,
						removeBackground: {
							color: item.removeBackground?.color,
							threshold: item.removeBackground?.threshold,
							hardness: item.removeBackground?.hardness
						}
					}
					map.set(annotation.id, annotation)
				}
			}
			set(map)
		})
		// Set to empty map if there're no annotations for the current slide
	} else if ($selectedSlideData) {
		set(new Map())
	}
})

// Fetch geojsons of selected slide
// Initial value is undefined
export const vectorLayers = derived(selectedSlideData, ($selectedSlideData, set) => {
	if ($selectedSlideData) {
		if ($selectedSlideData.frontmatter?.geojson?.length) {
			const resp = $selectedSlideData.frontmatter?.geojson
				.filter((item) => item.filename)
				.map((item) => {
					const path = $selectedSlideData.path + 'geojsons/' + item.filename
					return fetchJson(path).then((resp) => ({ ...item, resp, path }))
				})
			Promise.all(resp).then((data) => {
				const map = new Map()
				for (const item of data) {
					if (item.resp.type === 'Feature') {
						item.resp.properties.collection = item.path
					} else {
						for (const feature of item.resp.features) {
							// Add geojson path to each feature to check for existing features
							feature.properties.collection = item.path
						}
					}
					map.set(item.path, item.resp)
				}
				set(map)
			})
			// Set to empty map if there're no geojsons for the current slide
		} else if ($selectedSlideData) {
			set(new Map())
		}
	}
})

// Settings for mapbox layer taken from first slide of chapter
export const mapBoxLayer = derived(
	[slideData, selectedChapter],
	([$slideData, $selectedChapter], set) => {
		if ($selectedChapter) {
			const chapterData = $slideData.get($selectedChapter)
			const firstSlide = chapterData.entries().next().value[1][0].frontmatter.mapbox
			set(firstSlide)
		}
	}
)

selectedSlideShowCount.subscribe((value) => {
	console.log('slideShowCount', value)
})

selectedSlideData.subscribe((value) => {
	console.log('selectedSlideData', value)
})

georefAnnotations.subscribe((value) => {
	console.log('georefAnnotations', value)
})

vectorLayers.subscribe((value) => {
	console.log('vectorLayers', value)
})

mapBoxLayer.subscribe((value) => {
	console.log('mapBoxLayer', value)
})

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
	([$slideData, $selectedChapter]) => {
		if ($selectedChapter) {
			return $slideData.get($selectedChapter)
		}
	}
)

export const black = derived(selectedChapter, ($selectedChapter) =>
	$selectedChapter === 'argumentation' ? false : true
)

export const textColor = derived(selectedChapter, ($selectedChapter) =>
	$selectedChapter === 'argumentation' ? 'rgb(53, 110, 79)' : 'rgb(119, 63, 63)'
)

export const overview = derived(selectedSlideShow, ($selectedSlideShow) => {
	if ($selectedSlideShow) {
		if (
			$selectedSlideShow === 'home' ||
			$selectedSlideShow === 'overview' ||
			$selectedSlideShow === 'slide'
		) {
			return true
		} else return false
	}
})

const selectedSlideShowData = derived(
	[selectedChapterData, selectedSlideShow],
	([$selectedChapterData, $selectedSlideShow]) => {
		if ($selectedChapterData && $selectedSlideShow) {
			return $selectedChapterData.get($selectedSlideShow)
		}
	}
)

export const selectedSlideShowCount = derived(selectedSlideShowData, ($selectedSlideShowData) => {
	if ($selectedSlideShowData) return $selectedSlideShowData.length
})

// Data for the current slide
// First value is undefined
export const selectedSlideData = derived(
	[slideData, selectedChapter, selectedSlideShow, selectedSlideIndex],
	([$slideData, $selectedChapter, $selectedSlideShow, $selectedSlideIndex]) => {
		// First value of selectedChapter is undefined
		if ($selectedChapter) {
			const chapterData = $slideData.get($selectedChapter)
			// First value of selectedSlideShow is undefined
			if ($selectedSlideShow && chapterData) {
				const slideshowData = chapterData.get($selectedSlideShow)
				if (slideshowData) {
					return slideshowData[$selectedSlideIndex]
				}
			}
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
						const properties = item.resp.properties
						// Delete id property in case of duplicate ids
						delete item.resp.id
						item.resp.properties = {
							...properties,
							label: properties?.label || item.label,
							collection: item.path
						}
					} else {
						for (const feature of item.resp.features) {
							// Delete id property in case of duplicate ids
							delete feature.id
							// Add geojson path to each feature to check for existing features
							feature.properties = { ...feature.properties, collection: item.path }
							// Replace for the lines below to add labels from the frontmatter
							// feature.properties = {
							// 	...feature.properties,
							// 	collection: item.path,
							// 	label: feature.properties?.label || item.label
							// }
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
	([$slideData, $selectedChapter]) => {
		if ($selectedChapter) {
			const chapterData = $slideData.get($selectedChapter)
			if (chapterData) {
				const firstSlide = chapterData.entries().next().value[1][0].frontmatter.mapbox
				return firstSlide
			}
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

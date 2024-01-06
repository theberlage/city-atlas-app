import { readable, writable, derived, get } from 'svelte/store'
import { slideData as slideDataStore } from '$lib/shared/stores/markdownSlides.js'
import {
	selectedChapter as selectedChapterStore,
	selectedSlideShow as selectedSlideShowStore,
	selectedSlideIndex as selectedSlideIndexStore,
	selectedSlideShowCount
} from '$lib/shared/stores/selectedSlide.js'
import type { Slide } from '../types.js'

// slideData doesn't change so only get once
const slideData = get(slideDataStore)

// Hash store
export const hash = writable<string | undefined>(undefined)

// Parse hash and set stores each time hash changes
hash.subscribe((value) => {
	if (value !== undefined) {
		parseHash(value)
		console.log('!---! NEW HASH !---!', value, '!---!')
	}
})

function parseHash(hash: string) {
	const hashArray = hash.split('/')
	const length = hashArray.length
	let selectedChapter: Map<string, Slide[]>
	let selectedSlideShow: Slide[]

	// hashArray always has length 1
	// 0: # or empty
	// 1: chapter
	// 2: slideshow
	// 3: index

	if (length > 1 && slideData.has(hashArray[1])) {
		// Set group
		selectedChapter = slideData.get(hashArray[1])
		selectedChapterStore.set(hashArray[1])
		if (length > 2 && selectedChapter.has(hashArray[2])) {
			// Set slide show
			selectedSlideShow = selectedChapter.get(hashArray[2])
			selectedSlideShowStore.set(hashArray[2])
			if (length > 3 && +hashArray[3] !== 0 && +hashArray[3] <= selectedSlideShow.length) {
				// Set slide
				selectedSlideIndexStore.set(+hashArray[3] - 1)
			} else {
				// Select first slide of select slide show
				selectedSlideIndexStore.set(0)
				// window.location.hash = `#/${selectedChapter}/${selectedSlideShow}/1`
			}
		} else {
			// Select first slide of selected chapter
			selectedSlideShow = selectedChapter.entries().next().value[0]
			selectedSlideShowStore.set(selectedSlideShow)
			selectedSlideIndexStore.set(0)
			// window.location.hash = `#/${selectedChapter}/${selectedSlideShow}/1`
		}
	} else {
		// Select first slide of first chapter
		const selectedChapter = slideData.entries().next().value[0]
		selectedChapterStore.set(selectedChapter)
		selectedSlideShow = slideData.get(selectedChapter).entries().next().value[0]
		selectedSlideShowStore.set(selectedSlideShow)
		selectedSlideIndexStore.set(0)
		// window.location.hash = `#/${selectedChapter}/`
	}
}

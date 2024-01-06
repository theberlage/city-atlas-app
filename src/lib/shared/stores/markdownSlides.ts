import { readable, writable, derived } from 'svelte/store'
import { groupBy } from 'lodash-es'
import type { MarkdownSlide, Slide } from '$lib/shared/types.js'
import { slide } from 'svelte/transition'

// Importing Markdown and frontmatter for slides

const markdownSlides = import.meta.glob<MarkdownSlide>('$contents/data/*/*/slides/*.md', {
	eager: true
})

const slidesWithMetadata: Array<Slide> = Object.entries(markdownSlides).map(([id, slide]) => {
	let chapter: string = ''
	let slideshow: string = ''
	let index: number = -1
	let path = '/' + id.split('/contents/')[1].split('slides/')[0]

	const match =
		/\/data\/\d+-(?<chapter>\w+)\/\d+-(?<slideshow>\w+)\/slides\/(?<index>\d+).md$/.exec(id)

	if (match && match.groups) {
		chapter = match.groups.chapter
		slideshow = match.groups.slideshow
		index = parseInt(match.groups.index)
	}

	return {
		chapter,
		slideshow,
		index,
		path,
		...slide
	}
})

// Best way to group slides
// https://stackoverflow.com/questions/53929908/nested-array-group-by-with-lodash
// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects

function groupSlides() {
	const groupedSlides = new Map()
	for (const slide of slidesWithMetadata) {
		let currentChapter = groupedSlides.get(slide.chapter)
		if (currentChapter === undefined) {
			currentChapter = new Map()
			groupedSlides.set(slide.chapter, currentChapter)
		}
		let currentSlideshow = currentChapter.get(slide.slideshow)
		if (currentSlideshow === undefined) {
			currentSlideshow = []
			currentChapter.set(slide.slideshow, currentSlideshow)
		}
		currentSlideshow.push(slide)
	}
	return groupedSlides
}

const groupedSlides = groupSlides()

console.log('groupedSlides', groupedSlides)

export const slideData = readable<Map<string, Map<string, Array<Slide>>>>(groupedSlides)

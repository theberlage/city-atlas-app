export type MarkdownSlide = {
	html: string
	frontmatter: {
		meta: {
			heading: string
		}
		viewer: {
			bbox: Array<number>
			rotation: number
		}
		legend?: [
			{
				label: string
				fill?: string
				['fill-opacity']?: number
				stroke?: string
				['stroke-opacity']?: number
			}
		]
		allmaps?: [
			{
				label?: string
				annotation: string
				opacity?: number
				saturation?: number
				colorize?: string
				removeBackground?: {
					color: string
					threshold?: number
					hardness?: number
				}
			}
		]
		geojson?: [
			{
				label?: string
				filename: string
			}
		]
		xyz?: {
			url: string
			label: string
		}
		mapbox: {
			styleUrl: string
			accessToken: string
		}
	}
}

export type Slide = MarkdownSlide & {
	chapter: string
	slideshow: string
	index: number
	path: string
}

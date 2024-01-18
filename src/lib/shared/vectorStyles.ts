import { Fill, Stroke, Circle, Style } from 'ol/style.js'
import { hexToRGBA } from './utils.js'

export const defaultStyles = new Style({
	stroke: new Stroke({
		color: 'yellow',
		width: 4
	}),
	fill: new Fill({
		color: 'rgba(255, 255, 0, 0)'
	})
})

export const selectedStyles = new Style({
	stroke: new Stroke({
		color: 'yellow',
		width: 4
	}),
	fill: new Fill({
		color: 'yellow'
	}),
	image: new Circle({
		radius: 12,
		fill: new Fill({ color: 'black' }),
		stroke: new Stroke({
			color: 'black',
			width: 4
		})
	}),
	zIndex: 5
})

export const selectableStyles = new Style({
	stroke: new Stroke({
		color: 'yellow',
		width: 4
	}),
	fill: new Fill({
		color: 'rgba(255, 255, 255, 0)'
	}),
	image: new Circle({
		radius: 12,
		fill: new Fill({ color: 'rgba(255, 255, 0, 1)' }),
		stroke: new Stroke({
			color: 'black',
			width: 4
		})
	}),
	zIndex: 4
})

export function parseCustomFeatureStyle(properties) {
	let fillOpacity = 'fill-opacity' in properties ? properties['fill-opacity'] : 0
	let strokeOpacity = 'stroke-opacity' in properties ? properties['stroke-opacity'] : 1
	let fillColor =
		properties.fill && properties.fill.includes('rgba')
			? properties.fill
			: properties.fill && properties.fill.includes('#')
			? hexToRGBA(properties.fill, fillOpacity)
			: `rgba(255, 255, 0, ${fillOpacity})`
	let strokeColor =
		properties.stroke && properties.stroke.includes('rgba')
			? properties.stroke
			: properties.stroke && properties.stroke.includes('#')
			? hexToRGBA(properties.stroke, strokeOpacity)
			: `rgba(255, 255, 0, ${strokeOpacity})`
	let strokeWidth = 'stroke-width' in properties ? properties['stroke-width'] : 2
	let radius = 'radius' in properties ? properties.radius : 10
	return new Style({
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
}

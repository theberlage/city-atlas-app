import { Fill, Stroke, Style } from 'ol/style.js'
import { readable } from 'svelte/store'

export const defaultStyles = readable(
	new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'rgba(255, 255, 0, 0)'
		})
	})
)

export const selectedStyles = readable(
	new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'yellow'
		}),
		zIndex: 5
	})
)

export const selectableStyles = readable(
	new Style({
		stroke: new Stroke({
			color: 'yellow',
			width: 4
		}),
		fill: new Fill({
			color: 'rgba(0, 255, 255, 0)'
		}),
		zIndex: 4
	})
)

// From: https://gist.github.com/danieliser/b4b24c9f772066bcf0a6

function convertHexToRGBA(hexCode, opacity = 1) {
	let hex = hexCode.replace('#', '')

	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
	}

	const r = parseInt(hex.substring(0, 2), 16)
	const g = parseInt(hex.substring(2, 4), 16)
	const b = parseInt(hex.substring(4, 6), 16)

	/* Backward compatibility for whole number based opacity values. */
	if (opacity > 1 && opacity <= 100) {
		opacity = opacity / 100
	}

	return `rgba(${r},${g},${b},${opacity})`
}

export const hexToRGBA = readable(convertHexToRGBA)

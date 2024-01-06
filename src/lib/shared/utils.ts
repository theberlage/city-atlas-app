import { fromLonLat } from 'ol/proj.js'
import type { Coordinate } from 'ol/extent'

export function formatNumber(number: number, maximumFractionDigits = 2) {
	return new Intl.NumberFormat('nl-NL', { maximumFractionDigits }).format(number)
}

export async function fetchJson(url: string) {
	return fetch(url).then((response) => response.json())
}

export function calculateExtent(boundingBox: Coordinate) {
	return fromLonLat(boundingBox.slice(0, 2)).concat(fromLonLat(boundingBox.slice(2)))
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function stringToHTML(str: string) {
	var parser = new DOMParser()
	var doc = parser.parseFromString(str, 'text/html')
	return doc.body
}

// From: https://gist.github.com/danieliser/b4b24c9f772066bcf0a6

export function hexToRGBA(hexCode: string, opacity = 1) {
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

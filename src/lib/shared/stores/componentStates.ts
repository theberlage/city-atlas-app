import { readable, writable, derived, get } from 'svelte/store'

function toggleBoolean() {
	const { subscribe, update, set } = writable<boolean>(false)
	return {
		subscribe,
		set,
		toggle: () => update((value) => (value === false ? true : false))
	}
}

export const menu = toggleBoolean()

export const panel = toggleBoolean()

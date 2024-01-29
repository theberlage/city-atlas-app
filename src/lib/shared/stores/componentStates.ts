import { readable, writable, derived, get } from 'svelte/store'

function toggleBoolean(initialValue: boolean) {
  const { subscribe, update, set } = writable<boolean>(initialValue)
  return {
    subscribe,
    set,
    toggle: () => update((value) => (value === false ? true : false))
  }
}

export const menu = toggleBoolean(false)

export const panel = toggleBoolean(false)

export const bear = toggleBoolean(false)

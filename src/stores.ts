import { writable } from "svelte/store"

const isBrowser = typeof window !== 'undefined';

export const userid = writable(isBrowser ? localStorage.getItem("userid") : null);
export const token = writable(isBrowser ? localStorage.getItem("token") : null)
import { writable } from "svelte/store";
import { browser } from '$app/environment';

export const userid = writable(browser ? localStorage.getItem("userid") : null);
export const token = writable(browser ? localStorage.getItem("token") : null);
export const config = writable(browser ? JSON.parse(localStorage.getItem("config")) : {});
export const defaultConfig = writable(browser ? JSON.parse(localStorage.getItem("defaultConfig")) : {});
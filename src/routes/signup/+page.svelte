<script>
	import { API_BASE_URL } from '$lib/constants/env';
	import {userid, token} from '../../stores.ts';
	import { goto } from '$app/navigation';

	console.log("test");

	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && $userid && $token) goto('/');

	let inputUserid; let inputPassword; let inputEmail;

	let signedUp = false;
	let errorMessage = null;

	console.log(API_BASE_URL);

	const handleSubmit = async (e) => {
		let signupFields = {
			userid: inputUserid,
			password: inputPassword,
			email: inputEmail,
		};
		console.log(JSON.stringify(signupFields));
		const response = await fetch(`${API_BASE_URL}/signup`, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(signupFields),

		})
		if (!response.ok) {
			errorMessage = (await response.json()).message;
			console.log(errorMessage);
		} else {
			errorMessage = null;
			signedUp = true;
		}
	}
</script>

<svelte:head>
	<title>Sign up</title>
	<meta name="description" content="Sign up page" />
</svelte:head>

<section>
	<div>
		<h3>Sign up</h3>
		<form on:submit|preventDefault="{handleSubmit}">
			<input
				class="form-field"
				bind:value="{inputUserid}"
				type="userid"
				placeholder="Username"
			/>
			<input
				class="form-field"
				bind:value="{inputPassword}"
				type="password"
				autocomplete="new-password"
				placeholder="Password"
			/>
			<input
				class="form-field"
				bind:value="{inputEmail}"
				type="email"
				placeholder="Email"
			/>
			<button class="form-field">
				Sign up
			</button>
			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}
			{#if signedUp}
				<div>
					✔️ Sign up complete, log in now
				</div>
			{/if}
		</form>
		<p>
			Already have an account?
			<a href="/login"><strong class="link">Log in</strong></a>
		</p>
	</div>
</section>

<style>
	

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>

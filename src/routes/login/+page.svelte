<script>
	import { API_BASE_URL } from '$lib/constants/env';
	import {userid, token} from '../../stores.ts';
	import { goto } from '$app/navigation';

	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && $userid && $token) goto('/');

	let inputUserid; let inputPassword;

	let errorMessage = null;

	console.log(API_BASE_URL);

	const handleSubmit = async (e) => {
		let loginFields = {
			userid: inputUserid,
			password: inputPassword,
		};
		console.log(JSON.stringify(loginFields));
		const response = await fetch(`${API_BASE_URL}/login`, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginFields),

		})
		if (!response.ok) {
			errorMessage = (await response.json()).message;
			console.log(errorMessage);
		} else {
			let resJson = await response.json();
			localStorage.setItem('token', resJson.token);
			$token = resJson.token;
			localStorage.setItem('userid', resJson.userid);
			$userid = resJson.userid;
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login page" />
</svelte:head>

<section>
	<div>
		<h3>Login</h3>
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
				placeholder="Password"
			/>
			<button class="form-field">
				Login
			</button>
			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}
		</form>
		<p>
			Don't have an account?
			<a href="/signup"><strong>Sign up</strong></a>
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

	.error-message {
		color: #EF476F;
	}
</style>

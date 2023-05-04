<script>
	import { io } from 'socket.io-client';
	import { onDestroy } from 'svelte';
	import {userid, token} from '../stores.ts';
	import { goto } from '$app/navigation';
	import { API_BASE_URL } from '$lib/constants/env';

	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && (!$userid || !$token)) goto('/login');

	let connectAttempted = false;
	let started = false;
	let connecting = false;
	let connected = false;
	let errorMessage = null;
	let socket = null;

	let answer;
	let question;
	
	const connect = () => {
		connectAttempted = true;
		connecting = true;
		socket = io(API_BASE_URL);

		socket.on('connect', () => {
			connecting = false;
			console.log("client connected")
			socket.emit("auth", {token: $token, userid: $userid});
			connected = true;
			started = false
		});

		socket.on('disconnect', () => {
			connecting = false;
			console.log("client disconnected")
			connected = false;
		});

		socket.on('error', (data) => {
			console.log(`error: ${errorMessage}`);
			errorMessage = data.error;
		});

		socket.on('question', (data) => {
			console.log(`question: ${data.question}`);
			question = data.question;
			answer = '';
			socket.emit('ping', {userid: $userid});
		})
		
	};

	onDestroy(() => {
		if (!socket) return;
		socket.disconnect()
	});

	const start = () => {
		started = true;
		socket.emit("start", {userid: $userid});
	}

	const pause = () => {
		started = false;
		socket.emit("pause", {userid: $userid});
	}

	const attemptAnswer = () => {
		if (!question || !answer) return;
		console.log(`answer is ${answer}`)
		socket.emit("answer", {answer, userid: $userid});
	}


	
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Home page" />
</svelte:head>

<section>
	{#if connecting}
		<div>Connecting...</div>
	{:else if connectAttempted && connected}
		{#if errorMessage} 
			<div class="error-message">Error: {errorMessage}</div>
		{/if}
		{#if started}
			
			<form on:submit|preventDefault="{attemptAnswer}">
				<div class="game-area">
					<div class="question">{question}</div>
					<div class="number-container">
						<input
							class="number-input"
							bind:value="{answer}"
							type="number"
							placeholder="?"
						/>
					</div>
				</div>
			</form>
			
			<button on:click={pause}>Pause</button>
		{:else}
			<button on:click={start}>Start</button>
		{/if}
	{:else if connectAttempted && !connected}
		<div class="error-message">Error: disconnected</div>
		<button on:click={connect}>Reconnect</button>
	{:else}
		<button on:click={connect}>Connect</button>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.error-message {
		margin-bottom: 6px;
	}

	.question {
		font-size: 36px;
		flex: 1;
		text-align: right;
		margin-right: 0.25em;
		box-sizing: border-box;
	}

	.game-area {
		margin-bottom: 12px;
		display: flex;
		flex-direction: row;
		align-items: baseline;
		justify-content: center;
		width: 100vw;
	}

	.number-input {
		box-sizing: border-box;
		font-size: 36px;
		width: 6em;
	}

	.number-container {
		flex: 1;
		margin-left: 0.25em;
	}

	.attempt-button {
		box-sizing: border-box;
		font-size: 36px;
		margin-left: 6px;
	}
</style>

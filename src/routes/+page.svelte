<script>
	import { io } from 'socket.io-client';
	import { onDestroy } from 'svelte';
	import {userid, token, config, defaultConfig} from '../stores.ts';
	import { goto } from '$app/navigation';
	import { API_BASE_URL } from '$lib/constants/env';

	console.log($config);

	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && (!$userid || !$token)) goto('/login');

	let connectAttempted = false;
	let started = false;
	let connecting = false;
	let connected = false;
	let errorMessage = null;
	let socket = null;
	let showSettings = false;
	let incorrectAnswer = false;

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

		socket.on('incorrectAnswer', (data) => {
			incorrectAnswer = data.response;
			console.log(incorrectAnswer);
			console.log(answer);
			console.log(answer === incorrectAnswer);
		})
		
	};

	onDestroy(() => {
		if (!socket) return;
		socket.disconnect()
	});

	const start = () => {
		started = true;
		socket.emit("start", {userid: $userid, config: $config});
	}

	const pause = () => {
		started = false;
		socket.emit("pause", {userid: $userid});
	}

	const attemptAnswer = () => {
		if (!question || answer === null || answer === "") return;
		console.log(`answer is ${answer}`)
		socket.emit("answer", {answer, userid: $userid});
	}

	const toggleSettings = () => {
		showSettings = !showSettings;
	}

	const saveConfig = () => {
		console.log($config);
		localStorage.setItem('config', JSON.stringify($config));
	}

	const resetConfig = () => {
		$config = JSON.parse(JSON.stringify($defaultConfig));
		saveConfig();
	}
	
	const operationNames = {
		'+': "Addition",
		'-': "Subtraction",
		'*': "Multiplication",
		'/': "Division",
	}

	const explanation = (opConfig, op) => {
		const {negative, max} = opConfig;
		switch (op) {
			case '+':
				return `x + y = z, ${negative ? -max : 0} ≤ x, y ≤ ${max}`;
			case '-':
				return `x − y = z, ${negative ? -max : 0} ≤ x, y ≤ ${max}`;
			case '*':
				return `x × y = z, ${negative ? -max : 0} ≤ x, y ≤ ${max}`;
			case '/':
				return `z ÷ x = y, ${negative ? -max : 0} ≤ x, y ≤ ${max}`;
		}
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
							class:incorrect={incorrectAnswer === answer}
							class="number-input"
							bind:value={answer}
							type="number"
							placeholder="?"
						/>
					</div>
				</div>
			</form>
			
			<div class="row">
				<button on:click={pause}>Pause</button>
				<div class="settings-toggle" on:click={toggleSettings}>⚙️</div>
			</div>
		{:else}
			<div class="row">
				<button on:click={start}>Start</button>
				<div class="settings-toggle" on:click={toggleSettings}>⚙️</div>
			</div>
		{/if}
	{:else if connectAttempted && !connected}
		<div class="error-message">Error: disconnected</div>
		<button on:click={connect}>Reconnect</button>
	{:else}
		<button on:click={connect}>Connect</button>
	{/if}
	
</section>
{#if showSettings}
	<div class="settings">
		<button on:click={resetConfig} class="reset-config">Reset</button>
		{#each Object.entries($config) as [op, opConfig]}
			<div class="row">
				{operationNames[op]}: <span class="explanation">{explanation(opConfig, op)}</span>
			</div>
			<div class="row settings-row">
				{#each Object.entries(opConfig) as [name, value]}
					<div class="row settings-row">
						{name}:
						{#if typeof value === "number"}
							<input bind:value={$config[op][name]} on:change={saveConfig} class="small-input" type="number"/>
						{:else if typeof value === "boolean"}
							<input bind:checked={$config[op][name]} on:change={saveConfig} class="small-input" type="checkbox"/>
						{/if}
					</div>
				{/each}
			</div>
			
		{/each}
	</div>
{/if}

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

	.row {
		display: flex;
		flex-direction: row;
		align-items: baseline;
	}

	.settings-row {
		justify-content: space-evenly;
		align-items: center;
	}

	.settings-toggle {
		cursor: pointer;
		width: 0;
    	margin-left: 6px;
    	margin-right: -6px;
	}

	.settings {
		position: absolute;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		width: 50vw;
		left: 25vw;
		padding-top: 12px;
		padding-bottom: 12px;
    	box-sizing: border-box;
	}

	.small-input {
		margin: 0.25em;
	}

	.small-input[type="number"] {
		width: 5em;
	}

	.reset-config {
		position: absolute;
		top: 0px;
		right: 0px;
	}

	.incorrect:focus[type=number] {
		outline: 2px solid #EF476F;
	}

	.explanation {
		color: rgba(0, 0, 0, 0.35);
		margin-left: 6px;
	}
</style>

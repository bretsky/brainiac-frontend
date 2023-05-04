<script>
	import './styles.css';
	import {userid, token} from '../stores.ts';
	import { goto } from '$app/navigation';

	const logout = () => {
		$userid = null;
		localStorage.removeItem('userid');
		$token = null;
		localStorage.removeItem('token');
		goto('/login');
	}
</script>

<div class="app">
	{#if $userid && $token}
		<div class="header">
			<div class="userid"><strong>{$userid}</strong></div>
			<button on:click={logout}>
				Log out
			</button>
		</div>
	{:else}
		<div class="header">
			<button on:click={() => goto('/login')}>
				Log in
			</button>
		</div>
	{/if}
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}

	.userid {
		color: var(--color-theme-2);
		margin-right: 6px;
	}

	.header {
		padding: 12px;
		box-sizing: border-box;
		display: flex;
		width: 100%;
		justify-content: flex-end;
		align-items: baseline;
	}
</style>

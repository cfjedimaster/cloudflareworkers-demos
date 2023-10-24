/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Ai } from '@cloudflare/ai';

export default {
	async fetch(request, env) {
		const ai = new Ai(env.AI);

		const { searchParams } = new URL(request.url);
		let text = searchParams.get('text');

		const input = { text, source_lang:'en', target_lang: 'fr' };

		const response = await ai.run('@cf/meta/m2m100-1.2b', input);

		return new Response(JSON.stringify(response), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin':'*'
			}
		});

	},
};

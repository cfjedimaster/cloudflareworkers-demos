/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

async function getIncidents() {
	let resp = await fetch('https://lafayette911.org/WebService1.asmx/getCurrentTrafficConditions', 
			{ 
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			}
			});
	console.log('req made to laf911');
	let data = await resp.json();
	console.log('got data');
	return JSON.parse(data['d']).incidents;

}

export default {
	async fetch(request, env, ctx) {
		let d = await getIncidents();
		return new Response(JSON.stringify(d));
	},
};

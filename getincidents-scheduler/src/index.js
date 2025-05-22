/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {

  async scheduled(event, env, ctx) {
	console.log('Running scheduled call to GetIncidents');
	let request = new Request('https://www.google.com');
	let response = await env.getincidents.fetch(request.clone());
	let resp = await response.text();
	console.log('Done with Scheduler', resp);
  },

};

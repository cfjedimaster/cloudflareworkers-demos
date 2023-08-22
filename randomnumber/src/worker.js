export default {
	async fetch(request, env, ctx) {

		// ignore /favicon.ico
		if(request.url.includes('favicon.ico')) return new Response('');

		// https://community.cloudflare.com/t/parse-url-query-strings-with-cloudflare-workers/90286/3
		const { searchParams } = new URL(request.url);
		let min = parseInt(searchParams.get('min'),10);
		let max = parseInt(searchParams.get('max'),10);
		console.log(`inititial min, max: ${min}, ${max}`);
		if(isNaN(min)) min = 1;
		if(isNaN(max)) max = 100;
		if(min >= max) { min=1; max=100 };
		console.log(`corrected min, max: ${min}, ${max}`);

		let selectedNumber = getRandomIntInclusive(min, max);
		console.log(`selectedNumber: ${selectedNumber}`);
		
		return new Response(JSON.stringify({selectedNumber}), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8'
			}
		});


	},
};

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
}

async function uploadMedia(url, key) {
	// first, grab the bits of the url
	let imgreq = await fetch(url);
	let blob = new Blob([await imgreq.blob()]);

	let data = new FormData();
	data.append('file', blob);

	let mediaupload = await fetch('https://botsin.space/api/v2/media', {
		body:data,
		method:'post',
		headers:{
			'Authorization':`Bearer ${key}`
		}
	});

	return await mediaupload.json();

}

export default {
	async scheduled(event, env, ctx) {

		const KEY = env.MASTODON_KEY;

		let heroRequest = await env.randomsuperhero.fetch(new Request('http://127.0.0.1'));
		let hero = await heroRequest.json();
		console.log(`Got hero: ${hero.name}`);

		/*
		Generate the text for the toot.
		I'm using the 'detail' link which is not always the best, better than the wiki though :( 
		*/
		let toot = `
Your random Marvel superhero of the moment is: ${hero.name}.
More information here: ${hero.urls[0].url}
		`;
		
		let image = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
		let mediaOb = await uploadMedia(image, KEY);

		let data = new FormData();
		data.append('status', toot);
		data.append('media_ids[]', mediaOb.id);

		let resp = await fetch('https://botsin.space/api/v1/statuses', {
			body:data,
			method:'post',
			headers:{
				'Authorization':`Bearer ${KEY}`
			}
		});
		let result = await resp.json();
		// Not using result for now...

	},
};

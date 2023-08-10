// Based on checking the API (in Aug 2023) to see how the max number of characters
const CHAR_TOTAL = 1562;

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getSuperHero(privateKey, publicKey) {

	let selected = getRandomInt(0, CHAR_TOTAL);
	let url = `https://gateway.marvel.com:443/v1/public/characters?limit=1&apikey=${publicKey}&offset=${selected}`;

	// add hash
	let ts = new Date().getTime();
	let myText = new TextEncoder().encode(ts + privateKey + publicKey);

	let hash = await crypto.subtle.digest({
		name:'MD5'
	}, myText);

	// Credit: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
 	const hexString = [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

	url += '&hash='+encodeURIComponent(hexString)+'&ts='+ts;

	let resp = await fetch(url);
	let data = await resp.json();
	return data.data.results[0];
}

export default {
	async fetch(request, env, ctx) {
		const PRIVATE_KEY = env.MARVEL_PRIVATE_KEY;
		const PUBLIC_KEY = env.MARVEL_PUBLIC_KEY;
		let hero = await getSuperHero(PRIVATE_KEY, PUBLIC_KEY);
		console.log(`I got the hero ${hero.name}`);

		return new Response(JSON.stringify(hero), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8'
			}
		});
	},
};

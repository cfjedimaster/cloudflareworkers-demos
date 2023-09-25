
const IMAGE_NOT_AVAIL = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";

const getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getCover(pubKey,priKey) {

	//first select a random year
	let year = getRandomInt(1950, new Date().getFullYear()-1);
	//then a month
	let month = getRandomInt(1,12);

	let monthStr = month<10?"0"+month:month;
	//lame logic for end of month
	let eom = month==2?28:30;
	let beginDateStr = year + "-" + monthStr + "-01";
	let endDateStr = year + "-" + monthStr + "-" + eom;
	let url = "http://gateway.marvel.com/v1/public/comics?limit=100&format=comic&formatType=comic&dateRange="+beginDateStr+"%2C"+endDateStr+"&apikey="+pubKey;

	// add hash
	let ts = new Date().getTime();
	let myText = new TextEncoder().encode(ts + priKey + pubKey);

	let hash = await crypto.subtle.digest({
		name:'MD5'
	}, myText);

	const hexString = [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    url += '&hash='+encodeURIComponent(hexString)+'&ts='+ts;

	let result = await fetch(url);
	let data = (await result.json()).data;

	if(!data.results) {
		throw('No results available.');
	}

	let resultData = data.results;

	console.log('initial set',resultData.length);
	// if(comic.thumbnail && comic.thumbnail.path != IMAGE_NOT_AVAIL) {
	let comics = resultData.filter(c => {
	  return c.thumbnail && c.thumbnail.path !== IMAGE_NOT_AVAIL;
	});
	console.log('now we have ',comics.length);
	let selectedComic = comics[getRandomInt(0, comics.length-1)];
	//console.log(JSON.stringify(selectedComic,null,'\t'));
	//rewrite simpler
	let image = {};
	image.title = selectedComic.title;
	for(let x=0; x<selectedComic.dates.length;x++) {
	  if(selectedComic.dates[x].type === 'onsaleDate') {
		image.date = new Date(selectedComic.dates[x].date);
		//rewrite nicer
		image.date = `${image.date.getMonth()+1}/${image.date.getFullYear()}`;
	  }
	}

	image.url = selectedComic.thumbnail.path + "." + selectedComic.thumbnail.extension;
	if(selectedComic.urls.length) {
	  for(let x=0; x<selectedComic.urls.length; x++) {
		if(selectedComic.urls[x].type === "detail") {
		  image.link = selectedComic.urls[x].url;
		}
	  }
	}

	return image;
}

export default {
	async fetch(request, env, ctx) {
		const PRIVATE_KEY = env.MARVEL_PRIVATE_KEY;
		const PUBLIC_KEY = env.MARVEL_PUBLIC_KEY;
		console.log(PRIVATE_KEY, PUBLIC_KEY);
		let cover = await getCover(PUBLIC_KEY, PRIVATE_KEY);

		return new Response(JSON.stringify(cover), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin':'*',
				'Access-Control-Allow-Methods':'GET'
			}
		});

	},
};

// Lafayette, LA
const LAT = 30.22;
const LNG = -92.02;

async function getForecast(key,lat,lng) {
	let url = `https://api.pirateweather.net/forecast/${key}/${lat},${lng}`;
	let forecastResp = await fetch(url);
	return  await forecastResp.json();
}

export default {
	async fetch(request, env, ctx) {

		const APIKEY = env.PIRATE_KEY;

		let forecast = await env.weather4.get('cache');

		if(!forecast) {
			console.log('need to fetch, not in cache');
			let data = await getForecast(APIKEY,LAT,LNG);
			forecast = {
				created: new Date(), 
				daily: data.daily.data, 
				alerts: data.alerts
			}

			await env.weather4.put('cache', JSON.stringify(forecast), { expirationTtl: 60 });
		} else forecast = JSON.parse(forecast);

		return new Response(JSON.stringify(forecast), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8'
			}
		});

	},
};
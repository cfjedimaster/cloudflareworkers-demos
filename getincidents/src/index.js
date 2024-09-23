import { tzDate } from '@formkit/tempo';


async function getIncidents() {
	let resp = await fetch('https://lafayette911.org/WebService1.asmx/getCurrentTrafficConditions', 
			{ 
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			}
			});
	console.log('req made to laf911 A');
	let test = await resp.text();
	console.log('get text');
	console.log(test);
	let data = JSON.parse(test);
	//let data = await resp.json();
	console.log('got data');
	return JSON.parse(data['d']).incidents;

}

/*
I use tempo to try my best to convert the date to time since epoch. We can assume a time
zone as we know where our data comes from, Lafayette, LA

I am NOT happy with this code...
*/
function fixDate(timeStr) {
	let [date, time] = timeStr.split(' ');
	let [month, day, year] = date.split('/');
	let newDateStr = `${year}-${month}-${day} ${time}`;

	let newNewDateStr = tzDate(newDateStr, 'America/Chicago');
	let d = new Date(newNewDateStr);
	return d.valueOf() / 1000;
}

/*
I do some basic manipulation to the data

1) In location, remove the big white space between street and city
2) assisting is eith just one item, like POLICE, or, "POLICE (lots of white space FIRE)". I believe
we can assume one word values (looking at https://apps.lafayettela.gov/lafayette911/Scripts/jsUtilities.js, i believe we can)
3) map time to a proper time, assuming 24 hour clock and CST (NOT DONE YET)
4) geolocate location
*/
async function fixIncidents(incidents, cache, key) {
	for(let i=0; i<incidents.length; i++) {
		incidents[i].location = incidents[i].location.replaceAll(/ +/g," ");
		let geocoded = await cache.get(incidents[i].location);
		if(geocoded) {
			console.log(`had a cache for ${incidents[i].location}`);
			geocoded = JSON.parse(geocoded);
			incidents[i].lat = geocoded.lat;
			incidents[i].lng = geocoded.lng;
		} else {
			console.log(`need to get geo for ${incidents[i].location}`);
			let location = await geocode(incidents[i].location, key);
			incidents[i].lat = location.lat;
			incidents[i].lng = location.lng;
			await cache.put(incidents[i].location, JSON.stringify(location));
			//console.log(location);
		}
		incidents[i].assisting = incidents[i].assisting.replaceAll(/ +/g," ").split(" ");
		incidents[i].date_reported = fixDate(incidents[i].reported);
	}

	return incidents;
}

async function geocode(address,key) {
	let req = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`);
	let result = await req.json();
	return result.results[0].geometry.location;
}

export default {

	async fetch(request, env, ctx) {
		let d = await getIncidents();
		return new Response(JSON.stringify(d));
	},

	async scheduled(event, env, ctx) {
		console.log('entered scheduled execution');

		let incidents = await getIncidents();
		if(incidents.length === 0) return;
		console.log(`Going to process ${incidents.length} incidents`);
		incidents = await fixIncidents(incidents, env.geocache, env.GOOGLE_KEY);
		//console.log(incidents[0], incidents[1]);

		/*
		Now for each incident, we need to insert into our db...
		*/
		for(let i=0;i<incidents.length;i++) {

			// First, see if we exist in the db, we check by location, cause, and timestamp
			let stmt = await env.DB.prepare('select recordId from incidents where location = ? and cause = ? and reported = ?').bind(incidents[i].location, incidents[i].cause, incidents[i].reported).run();
			if(stmt.results.length === 0) {
				console.log(`Inserting new incident, ${incidents[i].location}, ${incidents[i].cause}, ${incidents[i].reported}`);
				await env.DB.prepare('insert into incidents(location, latitude, longitude, cause, assisting, reported, date_reported) values(?,?,?,?,?,?,?)').bind(
					incidents[i].location, incidents[i].lat, incidents[i].lng, incidents[i].cause, 
					JSON.stringify(incidents[i].assisting), incidents[i].reported, incidents[i].date_reported
				).run();
			} else console.log('Skipping existing incident');
		}

	},
};

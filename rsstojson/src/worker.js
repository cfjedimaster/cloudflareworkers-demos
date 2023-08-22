
import { XMLParser } from 'fast-xml-parser';
const options = {
	ignoreAttributes:false
}
const parser = new XMLParser(options);

export default {
	async fetch(request, env, ctx) {
		let req = await fetch('https://www.raymondcamden.com/feed_slim.xml');
		let xmlData = await req.text();
		let data = parser.parse(xmlData);
		let feed = reformatData(data.feed);
	
		return new Response(JSON.stringify(feed), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8'
			}
		});

	},
};

// I make some opinionated changes to the XML result specific for RSS feeds.
function reformatData(d) {
	if(d.link && d.link.length) {
		d.link = d.link.map(fixLink);
	}
	if(d.entry && d.entry.length) {
		d.entry.forEach(e => {
			if(e.link) e.link = fixLink(e.link);

			if(e.content) {
				let newContent = {};
				newContent.text = e.content['#text'];
				newContent.type = e.content['@_type'];
				e.content = newContent;
			}

			if(e.category && e.category.length) {
				e.category = e.category.map(c => {
					return c['@_term'];
				});
			}
		});
	}
	return d;
}

function fixLink(l) {
	let result = {};
	if(l['@_href']) result.href = l['@_href'];
	if(l['@_rel']) result.rel = l['@_rel'];
	if(l['@_type']) result.type = l['@_type'];
	if(l['@_title']) result.type = l['@_title'];
	return result;
}
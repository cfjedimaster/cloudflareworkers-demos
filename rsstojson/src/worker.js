import { XMLParser } from 'fast-xml-parser';

const options = {
	ignoreAttributes:false
}
const parser = new XMLParser(options);

const ALLOW_LIST = [
	'https://www.raymondcamden.com/feed_slim.xml',
	'https://recursive.codes/blog/feed',
	'https://scottstroz.com/feed.xml'
]

export default {
	async fetch(request, env, ctx) {

		const { searchParams } = new URL(request.url);
		let feedURL = searchParams.get('feed');

		if(!feedURL) {
			return new Response(JSON.stringify({
				error:'feed not passed in url'
			}), {
				headers: {
					'Content-Type':'application/json;charset=UTF-8',
					'Access-Control-Allow-Origin':'*'
				}
			});
		}

		if(ALLOW_LIST.indexOf(feedURL) === -1) {
			return new Response(JSON.stringify({
				error:'feed not allowed'
			}), {
				headers: {
					'Content-Type':'application/json;charset=UTF-8',
					'Access-Control-Allow-Origin':'*'
				}
			});
		}

		let req = await fetch(feedURL);
		let xmlData = await req.text();
		let data = parser.parse(xmlData);

		let feed = {};
		if(data.feed) feed = reformatData(data.feed);
		if(data.rss) feed = reformatData(data.rss);

		return new Response(JSON.stringify(feed), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin':'*'
			}
		});

	},
};

// I make some opinionated changes to the XML result specific for RSS feeds.
function reformatData(d) {

	if(d.link && d.link.length) {
		d.link = d.link.map(fixLink);
	}

	/*
	Final xformation... 
	*/
	let result = {
		feed: {}, 
		entries: {}
	}
	
	// feed is metadata about the feed
	if(d.channel) {
		result.feed = {
			title: d.channel.title,
			link: d.channel.link
		}

		result.entries = d.channel.item.map(i => {
			return {
				title: i.title, 
				link: i.link, 
				published: i.pubDate,
				content: i['content:encoded']
			}
		});
	} else {
		result.feed = {
			title: d.title
		}

		if(d.link) {
			let alt = d.link.filter(d => d.rel === 'alternate');
			if(alt.length) result.feed.link = alt[0]['href'];
			else {
				// accept the link with _no_ rel
				result.feed.link = d.link.filter(d => !d.rel)[0]['href'];
			}
		}

		result.entries = d.entry.map(e => {

			if(e.link) e.link = fixLink(e.link);

			if(e.content) {
				let newContent = {};
				newContent.text = e.content['#text'];
				newContent.type = e.content['@_type'];
				e.content = newContent;
			}

			return {
				title: e.title, 
				published: e.updated, 
				content: e.content.text,
				link: e.link.href
			}

		});

	}

	return result;
}

function fixLink(l) {
	let result = {};
	if(l['@_href']) result.href = l['@_href'];
	if(l['@_rel']) result.rel = l['@_rel'];
	if(l['@_type']) result.type = l['@_type'];
	if(l['@_title']) result.type = l['@_title'];
	return result;
}
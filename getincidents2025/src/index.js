import * as cheerio from 'cheerio';

async function getIncidents() {
  let result = [];
  let dataReq = await fetch('https://lafayette911.org/wp-json/traffic-feed/v1/data');
  let html = (await dataReq.json()).data;
  const $ = await cheerio.load(html);
  let $tableRows = $('table tr');

  // should have one row of the header even when no issues
  if($tableRows.length <= 1) return result;
  
  for(let i=1;i<$tableRows.length;i++) {
    let row = $tableRows.get(i);
    let cells = $(row).find('td');
    result.push({
      location:$(cells[0]).text().trim().replaceAll(/\n/g,'').replaceAll(/ +/g,' '),
      reason:$(cells[1]).text().trim(),
      time:$(cells[2]).text().trim(),
      assisting:$(cells[3]).text().trim().split(/\n/).map(x => x.trim()),
    });
    
  }

  return result;
}

export default {
	async fetch(request, env, ctx) {
		let result = await getIncidents();
		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type':'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin':'*',
				'Access-Control-Allow-Methods':'GET'
			}
		});

	},
};

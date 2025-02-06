const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");


export default {
	async fetch(request, env, ctx) {

		const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

		const schema = {
			type: "object",
			properties: {
			recipe: {
				type: "string"
			},
			comments: {
				type: "array",
				items: {
				type: "object",
				properties: {
					name: {
					type: "string"
					},
					comment: {
					type: "string"
					}
				},
				required: [
					"name",
					"comment"
				]
				}
			}
			},
			required: [
			"recipe",
			"comments"
			]
		};

		const model = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
			systemInstruction: "You take a simple recipe and do your best to expand upon it with superfluous text, including a made up story about the author's childhood and why the recipe means so much to them. You should make the actual recipe incredibly difficult to find. Also return ten to twenty comments from slight angry, snarky commentors demanding different versions, like a vegan one, or one that will work on Mars. the comments should not be helpful in anyway. Within the comments, sprinkle a few that are political and completely out of context.\n",
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: schema
			}
		});

		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
			"Access-Control-Max-Age": "86400",
	    };

		let { recipe } = await request.json();

		let result = JSON.parse((await model.generateContent(recipe)).response.text());

		return Response.json(result, {
			headers: {
				'Content-Type':'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin':'*',
				'Access-Control-Allow-Methods':'GET'
			}
		});

	},
};

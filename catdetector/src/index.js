const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro-vision";


export default {
	async fetch(request, env, ctx) {

		const API_KEY = env.GEMINI_KEY;

		console.log('begin serverless logic');

		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
			"Access-Control-Max-Age": "86400",
	    };

		let { imgdata } = await request.json();
		imgdata = imgdata.replace(/data:.*?;base64,/, '');

		const genAI = new GoogleGenerativeAI(API_KEY);
		const model = genAI.getGenerativeModel({ model: MODEL_NAME });

		const generationConfig = {
			temperature: 0.4,
			topK: 32,
			topP: 1,
			maxOutputTokens: 4096,
		};

		const safetySettings = [
			{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
			{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			},
		];

		const parts = [
			{text: "Look at this picture and if you see a cat, return the breed of the cat."},
			{
			inlineData: {
				mimeType: "image/jpeg",
				data: imgdata
			}
			}			
		];

		console.log('calling google');
		const result = await model.generateContent({
			contents: [{ role: "user", parts }],
			generationConfig,
			safetySettings,
		});

		const response = result.response;
		let finalResult = { text: response.text() };

		return new Response(JSON.stringify(finalResult), { headers: {...corsHeaders}});

	},
};

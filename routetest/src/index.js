import { Router, json, createCors, error } from 'itty-router';

const { preflight, corsify } = createCors();

const router = Router();

const CATS = [
	{name:'Luna', gender:'female', age: 12 },
	{name:'Pig', gender:'female', age: 10},
	{name:'Elise', gender:'female', age: 111},
	{name:'Zelda', gender:'female', age: 1},
	{name:'Grace', gender:'female', age: 13},
];

router.all('*', preflight);

router.get('/', async (req) => {
	return CATS;
});

router.get('/:name', async (req) => {
	const name = req.params.name;
	return CATS.filter(c => c.name.toUpperCase() === name.toUpperCase());
});

export default {
	async fetch(request, env, ctx) {
		return router.handle(request).then(json).catch(error).then(corsify);
	},
};
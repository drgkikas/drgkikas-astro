import { getCollection } from 'astro:content';

const rtms = await getCollection('rtms');
console.log(rtms.map(p => p.id));

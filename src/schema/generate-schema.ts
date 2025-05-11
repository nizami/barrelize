import {json} from 'typia';
import {Config, DEFAULT_CONFIG} from '../config/config.js';

const {schemas} = json.schema<Config>().components;
const schema: any = schemas?.['Config'];

schema.properties['barrels'].items = schemas?.['BarrelConfig'];
schema.properties['singleQuote'].default = DEFAULT_CONFIG.singleQuote;
schema.properties['semi'].default = DEFAULT_CONFIG.semi;
schema.properties['insertFinalNewline'].default = DEFAULT_CONFIG.insertFinalNewline;

const {properties} = schema.properties.barrels.items;

for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
  properties[key].default = value;
}

console.log(JSON.stringify({$schema: 'http://json-schema.org/draft-07/schema', ...schema}, null, 2));

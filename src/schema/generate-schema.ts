import {json} from 'typia';
import {Config, DEFAULT_CONFIG} from '../config/config.js';

const schema: any = json.schema<Config>().components.schemas?.['Config'];

const {properties} = schema.properties.directories.items;

for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
  properties[key]['default'] = value;
}

console.log(JSON.stringify({$schema: 'http://json-schema.org/draft-07/schema', ...schema}, null, 2));

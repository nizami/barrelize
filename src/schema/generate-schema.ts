import {json} from 'typia';
import {Config} from '../config/config';

const schema: any = json.schema<Config>().components.schemas?.['Config'];

console.log(JSON.stringify({$schema: 'http://json-schema.org/draft-07/schema', ...schema}, null, 2));

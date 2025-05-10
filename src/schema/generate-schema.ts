import {json} from 'typia';
import {Config} from '../config/config';

console.log(JSON.stringify(json.schema<Config>().components.schemas?.['Config'], null, 2));

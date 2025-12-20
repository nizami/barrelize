import {$Config} from '../src/config/config';

const schema = $Config.toJSONSchema({io: 'input'});
console.log(JSON.stringify(schema, null, 2));

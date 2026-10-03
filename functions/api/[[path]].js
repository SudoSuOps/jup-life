import {handleApi} from '../../server/app.js';
export const onRequest=context=>handleApi(context);

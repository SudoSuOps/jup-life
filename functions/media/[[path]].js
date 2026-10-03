import {handleMedia} from '../../server/app.js';
export const onRequest=context=>handleMedia(context);

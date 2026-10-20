import {handleRestaurantRequest} from '../../server/restaurant.js';
import {limit} from '../../server/app.js';

export const onRequestPost=context=>handleRestaurantRequest(context,{limit});
export const onRequest=()=>new Response(JSON.stringify({error:'Method not allowed.'}),{status:405,headers:{'Content-Type':'application/json; charset=utf-8'}});

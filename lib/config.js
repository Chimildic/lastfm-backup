let USERNAME = '';
let API_KEY = '';

let PER_PAGE; // max 200
let EMPTY; // if no value
let ASYNC_REQUEST_COUNT;

function init(params){
    USERNAME = params.username;
    API_KEY = params.apiKey;
    PER_PAGE = params.perPage > 200 ? 200 : params.perPage || 200;
    EMPTY = params.empty || '#no value#';
    ASYNC_REQUEST_COUNT = params.asyncRequestCount || 50;
}
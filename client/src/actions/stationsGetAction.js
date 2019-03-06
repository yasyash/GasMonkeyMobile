import { GET_STATION_LIST} from "./types";


import store from '../reducers/rootReducer';


//real store functions place below
export function getStationsList(data) {
    store.dispatch({ type: GET_STATION_LIST, data });
};


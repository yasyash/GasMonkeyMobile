import { SET_STATION_LIST, DELETE_STATION_LIST, FIRST_STATION_LIST } from "./types";


import store from '../reducers/rootReducer';


//real store functions place below
export function addActiveStationsList(data) {
    store.dispatch({ type: SET_STATION_LIST, data });
};

export function deleteActiveStationsList() {
    store.dispatch({ type: DELETE_STATION_LIST });
};
export function getFirstActiveStationsList() {
    store.dispatch({ type: FIRST_STATION_LIST });
};

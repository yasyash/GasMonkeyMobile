import { SET_METEO_LIST, DELETE_METEO_LIST, SET_METEO_STATION } from './types'
import store from '../reducers/rootReducer';

export function addMeteoList(data) {
    store.dispatch({ type: SET_METEO_LIST, data });
}

export function deleteMeteoList() {
    store.dispatch({ type: DELETE_METEO_LIST });
}

export function setMeteoStation(data) {
    store.dispatch({ type: SET_METEO_STATION, data });
}
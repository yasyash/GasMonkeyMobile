import { SET_SENSORS_LIST, DELETE_SENSORS_LIST } from './types';

import {SET_ACTIVE_SENSORS_LIST, DELETE_ACTIVE_SENSORS_LIST} from './types';

import store from '../reducers/rootReducer';

export function addSensorsList(data) {
    store.dispatch({ type: SET_SENSORS_LIST, data });
}

export function deleteSensorsList() {
    store.dispatch({ type: DELETE_SENSORS_LIST });
}

//real store functions place below
export function addActiveSensorsList(data) {
    store.dispatch({ type: SET_ACTIVE_SENSORS_LIST, data });
}

export function deleteActiveSensorsList() {
    store.dispatch({ type: DELETE_ACTIVE_SENSORS_LIST });
}
import { SET_DATA_LIST, DELETE_DATA_LIST, SET_CURRENT_POINT, DELETE_CURRENT_POINT } from './types'
import store from '../reducers/rootReducer';

export function addDataList(data) {
    store.dispatch({ type: SET_DATA_LIST, data });
}

export function deleteDataList() {
    store.dispatch({ type: DELETE_DATA_LIST });
}

export function pointAddAction(data) {
    store.dispatch({ type: SET_CURRENT_POINT, data });
}

export function pointDeleteAction(data) {
    store.dispatch({ type: DELETE_CURRENT_POINT, data });
}
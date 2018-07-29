import { SET_DATA_LIST, DELETE_DATA_LIST } from './types'
import store from '../reducers/rootReducer';

export function addDataList(data) {
    store.dispatch({ type: SET_DATA_LIST, data });
}

export function deleteDataList() {
    store.dispatch({ type: DELETE_DATA_LIST });
}
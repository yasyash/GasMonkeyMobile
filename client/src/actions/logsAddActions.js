import { SET_LOGS_LIST, DELETE_LOGS_LIST } from './types'
import store from '../reducers/rootReducer';

export function addLogsList(data) {
    store.dispatch({ type: SET_LOGS_LIST, data });
}

export function deleteLogsList() {
    store.dispatch({ type: DELETE_LOGS_LIST });
}
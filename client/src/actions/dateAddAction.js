import { SET_DATE, SET_REPORT_DATE, SET_CURRENT_TIME, DELETE_CURRENT_TIME } from './types'
import store from '../reducers/rootReducer';

export function dateAddAction(data) {
    store.dispatch({ type: SET_DATE, data });
}

export function dateAddReportAction(data) {
    store.dispatch({ type: SET_REPORT_DATE, data });
}

export function timeAddAction(data) {
    store.dispatch({ type: SET_CURRENT_TIME, data });
}

export function timeDeleteAction(data) {
    store.dispatch({ type: DELETE_CURRENT_TIME, data });
}
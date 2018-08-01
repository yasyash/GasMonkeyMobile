import { SET_DATE, SET_REPORT_DATE } from './types'
import store from '../reducers/rootReducer';

export function dateAddAction(data) {
    store.dispatch({ type: SET_DATE, data });
}

export function dateAddReportAction(data) {
    store.dispatch({ type: SET_REPORT_DATE, data });
}

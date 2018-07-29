import { SET_MACS_LIST } from './types'
import store from '../reducers/rootReducer';

export function addConsentrationList(data) {
    store.dispatch({ type: SET_MACS_LIST, data });
}


import { SET_DATE } from './types'
import store from '../reducers/rootReducer';

export function dateAddAction(data) {
    store.dispatch({ type: SET_DATE, data });
}


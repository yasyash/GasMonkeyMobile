import { ADD_FLASH_MSG, DELETE_FLASH_MSG } from './types'
import store from '../reducers/rootReducer';

export function addFlashMessage(message) {
    store.dispatch({ type: ADD_FLASH_MSG, message });
}

export function deleteFlashMessage(id) {
    return { type: DELETE_FLASH_MSG, id }
}
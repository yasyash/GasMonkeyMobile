import { ADD_FLASH_MSG, DELETE_FLASH_MSG } from "../actions/types";
import shortid from 'shortid';
import findIndex from 'lodash/findIndex';

export default (state = [], action = {}) => {

    switch (action.type) {
        case ADD_FLASH_MSG:
            return [
                ...state,
                {
                    id: shortid.generate(),
                    type: action.message.type,
                    text: action.message.text
                }
            ];

        case DELETE_FLASH_MSG:
            const indx = findIndex(state, { id: action.id })

            if (indx >= 0) {
                return [
                    ...state.slice(0, indx),
                    ...state.slice(indx + 1, )
                ];
            } else return state;

        default: return state;

    }

}
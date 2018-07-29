    import Axios from "axios";

export function createMyEvent(event) {
    return dispatch => {
        return Axios.post('/api/events', event);


    }
}
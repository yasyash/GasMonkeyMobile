import React from 'react';
import UserEventForm from './userEventForm';
import { createMyEvent } from './actions/eventActions';
import { connect } from 'react-redux';

class UserEventPage extends React.Component {
    render() {
        return (
            <div className="container">

                <UserEventForm createMyEvent={ createMyEvent } />

            </div>
        );
    }
}

export default connect(null, { createMyEvent })(UserEventPage);
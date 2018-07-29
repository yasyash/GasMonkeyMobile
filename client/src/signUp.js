import React from 'react';
import PropTypes from 'prop-types';

import SignupForm from './signupForm';
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
//import { connect } from 'net';
import { connect } from 'react-redux';
import { userSignupRequest, isUserExists } from './actions/signupActions';
import { applyMiddleware } from 'redux';
import { addFlashMessage } from './actions/flashMessages';

class signUp extends React.Component {

    render() {
        const { userSignupRequest, addFlashMessage, isUserExists } = this.props;
        //const {store} = this.store;
        return (
            <div className="container">

                <div className="row">
                    <div className="col-md-4 col-md-offset-4">
                        <SignupForm userSignupRequest={userSignupRequest}
                            addFlashMessage={addFlashMessage}
                            isUserExists={isUserExists} />
                    </div>

                </div>
            </div>

        );
    }
}

signUp.propTypes = {
    userSignupRequest: PropTypes.func.isRequired,
    addFlashMessage: PropTypes.func.isRequired,
    isUserExists: PropTypes.func.isRequired

}



//export default connect((state) => {return {}}, {userSignupRequest})(signUp);
export default connect((state) => { return {} }, { userSignupRequest, addFlashMessage, isUserExists })(signUp);
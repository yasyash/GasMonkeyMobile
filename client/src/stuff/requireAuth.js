import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types'

import { addFlashMessage } from '../actions/flashMessages';

export default function (ComposedComponent) {

    class Authenticate extends Component {

        componentDidMount() {
            if (!this.props.isAuthenticated) {
                addFlashMessage({
                    type: 'error', text: 'Для доступа необходима авторизация...'
                });

                this.props.history.push('/login');
            }
        }

        componentWillUpdate(nextProps) {
            if (!nextProps.isAuthenticated) {
                this.props.history.push('/login');
            }
        }

        render() {
            return (

                <ComposedComponent {...this.props} />
            );
        }
    }


    Authenticate.propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        addFlashMessage: PropTypes.func.isRequired
    }

    Authenticate.contextTypes = {
        router: PropTypes.object.isRequired
    }

    function mapStateToProps(state) {
        return {
            isAuthenticated: state.auth[0].isAuthenticated
        };
    }

    return connect(mapStateToProps, { addFlashMessage })(withRouter(Authenticate));
}

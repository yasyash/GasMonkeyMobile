import React from 'react';
//import axios from 'axios';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route } from 'react-router';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';



import validateInput from '../../api/shared/validations';

import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import TxtFieldGroup from './stuff/txtField';
import { addFlashMessage } from './actions/flashMessages';

class SignupForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            passwrd: '',
            confirm_passwrd: '',
            mobile: '',
            errors: {},
            isDisabled: false,
            invaliduser: false,
            invalidemail: false

        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.checkUserExists = this.checkUserExists.bind(this);
    }

    checkUserExists(e) {
        const field = e.target.name;
        const val = e.target.value;

        if (val !== '') {
            this.props.isUserExists(val).then(resp => {
                let errors = this.state.errors;
                let invaliduser = this.state.invaliduser;
                let invalidemail = this.state.invalidemail;
                
                if (resp.data.user) {

                    if (field === 'username') {
                        errors[field] = 'Пользователь с данным именем уже существует...';
                        invaliduser = true;
                    }
                    if (field === 'email') {
                        errors[field] = 'Пользователь с данным ' + field + ' уже существует...';
                        invalidemail = true;
                    }
                } else {
                    errors[field] = '';

                    if (field === 'username') {
                        invaliduser = false;
                    }
                    if (field === 'email') {
                        invalidemail = false;
                    }
                }
                this.setState({ errors, invaliduser, invalidemail });

            })
        }

    }


    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    isValid() {
        const { errors, isValid } = validateInput(this.state);

        if (!isValid) {
            this.setState({ errors });
        }

        return isValid;
    }


    onSubmit(e) {
        e.preventDefault();

        if (this.isValid()) {
            this.setState({ errors: {}, isDisabled: true });
            //axios.post('/api/users', { user: this.state });
            this.props.userSignupRequest(this.state).then(
                () => {
                    this.setState({ errors: {}, isDisabled: false });
                    // alert('Вы успешно зарегистрированы!');
                    //this.props.addFlashMessage({ type: 'success', text: 'Вы успешно зарегистрированы!' });
                    addFlashMessage({ type: 'success', text: 'Вы успешно зарегистрированы!' });
                    //test({type: 'success', text: 'Вы успешно зарегистрированы!'});
                   // alert('ok');

                    //this.props.history.push('/');
                },
                ({ response }) => this.setState({ errors: response.data, isDisabled: false })
            );
        }

    }

    render() {

        const { errors } = this.state;

        return (
            <form onSubmit={this.onSubmit}><br />
                <h5>Регистрация пользователя.</h5>
                <TxtFieldGroup
                    field="username"
                    value={this.state.username}
                    label="Имя пользователя:"
                    error={errors.username}
                    onChange={this.onChange}
                    checkUserExists={this.checkUserExists}
                />
                <TxtFieldGroup
                    field="passwrd"
                    value={this.state.passwrd}
                    label="Пароль:"
                    error={errors.passwrd}
                    onChange={this.onChange}
                    type="password"
                />
                <TxtFieldGroup
                    field="confirm_passwrd"
                    value={this.state.confirm_passwrd}
                    label="Подтвердите пароль:"
                    error={errors.confirm_passwrd}
                    onChange={this.onChange}
                    type="password"

                />
                <TxtFieldGroup
                    field="email"
                    value={this.state.email}
                    label="Email:"
                    error={errors.email}
                    onChange={this.onChange}
                    checkUserExists={this.checkUserExists}

                />
                <TxtFieldGroup
                    field="mobile"
                    value={this.state.mobile}
                    label="моб. телефон:"
                    error={errors.mobile}
                    onChange={this.onChange}
                />
                <div className="form-group">
                    <button disabled={this.state.isDisabled || 
                    this.state.invaliduser ||
                    this.state.invalidemail } className="btn btn-primary btn-sm">
                        Регистрация
                    </button>
                </div>
            </form>
        );
    }
}

SignupForm.propTypes = {
    userSignupRequest: PropTypes.func.isRequired,
    addFlashMessage: PropTypes.func.isRequired,
    isUserExists: PropTypes.func.isRequired
}

SignupForm.contextType = {
    router: PropTypes.object.isRequired
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    push: actions.push,
    remove: actions.remove,
    // dispatch // <-- remove this
}, dispatch);


export default (withRouter(SignupForm));
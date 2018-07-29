import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from './actions/loginActions';
import TxtFieldGroup from './stuff/txtField';
import validateInput from '../../api/shared/loginValidation';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            identifier: '',
            passwrd: '',
            errors: {},
            isLoading: false


        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    isValid() {
        const { errors, isValid } = validateInput(this.state);
        if (!isValid) {
            this.setState({ errors });
            return isValid;
        }
        this.setState({ errors: {}, isLoading: true });
        this.props.login(this.state).then(
            (resp) => { this.props.history.push('/'); }
        ).catch((err) => { this.setState({ errors: err.response.data.errors, isLoading: false }) });

        return isValid;
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.isValid()) {

        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const { identifier, passwrd, errors, isLoading } = this.state;
        return (
            < form onSubmit={this.onSubmit} ><br />
                <h5>Авторизация пользователя:</h5>

                {errors.form && <div className="alert alert-danger"> {errors.form}</div>}
                <TxtFieldGroup
                    field="identifier"
                    value={identifier}
                    label="Имя пользователя / email:"
                    error={errors.identifier}
                    onChange={this.onChange}
                />
                <TxtFieldGroup
                    field="passwrd"
                    value={passwrd}
                    label="Пароль:"
                    error={errors.passwrd}
                    onChange={this.onChange}
                    type="password"
                />

                <div className="form-group">
                    <button disabled={isLoading} className="btn btn-primary btn-sm">
                        Войти
                    </button>
                </div>
            </form>
        );
    }
}

LoginForm.propTypes = {
    login: PropTypes.func.isRequired
}

export default connect(null, { login })(withRouter(LoginForm));
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TxtFieldGroup from './stuff/txtField';
import { createMyEvent } from './actions/eventActions';

class UserEventForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            errors: {},
            isLoading: false


        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.createMyEvent(this.state);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const { title, errors, isLoading } = this.state;
        return (
            < form onSubmit={this.onSubmit} ><br />
                <h5>Проверка пользователя:</h5>

                <TxtFieldGroup
                    field="title"
                    value={title}
                    label="Заголовок:"
                    error={errors.title}
                    onChange={this.onChange}
                />


                <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-sm">
                        Создать
                    </button>
                </div>
            </form>
        );
    }
}

UserEventForm.propTypes = {
    createMyEvent: PropTypes.func.isRequired
}

UserEventForm.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(null, { createMyEvent })(withRouter(UserEventForm));
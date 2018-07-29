import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';


const TxtFieldGroup = ({ field, value, label, error, type, onChange, checkUserExists }) => {
    return (
        <div className="form-group">
            <label className="control-label">{label}</label>
            <input value={value}
            onBlur={checkUserExists}
                onChange={onChange}
                type={type} name={field}
                className={classnames("form-control ", { 'is-invalid': error })} />
            {error && <span className={classnames("text-sm-left ", { "text-danger": error })}>{error}</span>}
        </div>
    );
}

TxtFieldGroup.propTypes = {
    field: propTypes.string.isRequired,
    value: propTypes.string.isRequired,
    label: propTypes.string.isRequired,
    error: propTypes.string,
    type: propTypes.string.isRequired,
    onChange: propTypes.func.isRequired,
    checkUserExists: propTypes.func

}

TxtFieldGroup.defaultProps = {
    type: 'text'
}

export default TxtFieldGroup;
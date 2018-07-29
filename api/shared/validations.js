import Validator from 'validator';
import isEmpty from 'lodash.isempty';



export default function commonValidations(data) {
    let errors = {};

if ((data.email==''))
{
    errors.email = 'Это поле обязательно';
}

if (!Validator.isEmail(data.email))
{
    errors.email = 'Формат email не верен.';
}

if ((data.username ==''))
{
    errors.username = 'Это поле обязательно';
}

if ((data.passwrd) =='')
{
    errors.passwrd = 'Это поле обязательно';
}

if ((data.confirm_passwrd ==''))
{
    errors.confirm_passwrd = 'Это поле обязательно';
}

if (!Validator.equals( data.passwrd, data.confirm_passwrd))
{
    errors.confirm_passwrd = 'Пароли не совпадают';
}

if ((data.mobile ==''))
{
    errors.mobile = 'Это поле обязательно';
}

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
import Validator from 'validator';
import isEmpty from 'lodash.isempty';



export default function valdateInput(data){
    let errors={};

if (Validator.isEmpty(data.identifier))
{
    errors.identifier = 'Поле должно быть заполнено';
}

if (Validator.isEmpty(data.passwrd))
{
    errors.passwrd = 'Поле должно быть заполнено';
}
    return{
        errors,
        isValid: isEmpty(errors)
    };
}
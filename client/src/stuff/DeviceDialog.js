
import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';

import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import isEmpty from 'lodash.isempty';
import shortid from 'shortid';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});
//                                <MenuItem value={'dir_wind'}>Направление ветра</MenuItem>



export default class DeviceDialog extends React.Component {
    constructor(props) {
        super(props);
        const { openDialog,
            title,
            def_colour,
            max_consentration,
            max_day_consentration } = props;

        this.state = {
            openDialog,
            title: 'Введите характеристики датчика:',
            def_colour,
            max_consentration,
            max_day_consentration

        };
        if (!isEmpty(title)) this.state.title = title;
    };



    render() {
        const { id } = this.state;
        return (

            <div>
                <Dialog
                    open={this.props.openDialog}
                    onClose={this.handleDialogClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Добавьте данные</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {this.state.title}
                        </DialogContentText>
                        <DialogContentText>
                            <br />
                            Метеодатчик:
                        <Checkbox
                                onChange={this.props.handleChange('is_meteo')}
                                color="primary"
                                value='true'
                            />
                        </DialogContentText>

                        <FormControl >
                            <Select
                                value={this.props.meteo_field}
                                onChange={this.props.handleChange('meteo_field')}
                                input={<Input name="meteo_field" id="meteo-field" />}
                            >

                                <MenuItem value={'bar'}>Атм. давление</MenuItem>
                                <MenuItem value={'temp_out'}>Темп. внешняя</MenuItem>
                                <MenuItem value={'hum_out'}>Влажность внеш.</MenuItem>
                                <MenuItem value={'speed_wind'}>Скорость ветра</MenuItem>
                                <MenuItem value={'dir_wind'}>Направление ветра</MenuItem>
                                <MenuItem value={'rain'}>Интенс. осадков</MenuItem>
                                <MenuItem value={'uv_dose'}>Гамма-излучение</MenuItem>

                                <MenuItem value={'temp_in'}>Темп. внутренняя</MenuItem>
                                <MenuItem value={'hum_in'}>Влажность внутр.</MenuItem>

                            </Select>

                            <FormHelperText>Тип метеопараметра</FormHelperText>
                        </FormControl>

                        <TextField
                            autoFocus
                            margin="dense"
                            id="idd"
                            label="ID поста наблюдения"
                            type="text"
                            value={this.props.idd}
                            fullWidth
                            onChange={this.props.handleChange('idd')}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="typemeasure"
                            label="Тип измеряемой величины"
                            type="text"
                            fullWidth
                            value = {this.props.typemeasure}
                            onChange={this.props.handleChange('typemeasure')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="unit_name"
                            label="Размерность"
                            type="text"
                            value={this.props.unit_name}
                            fullWidth
                            onChange={this.props.handleChange('unit_name')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="serialnum"
                            label="ID датчика"
                            type="text"
                            value={this.props.serialnum}
                            fullWidth
                            onChange={this.props.handleChange('serialnum')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="def_colour"
                            label="Цвет линии на графике"
                            type="text"
                            value={this.state.def_colour}
                            fullWidth
                            onChange={this.props.handleChange('def_colour')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="max_consentration"
                            label="ПДК м."
                            type="text"
                            value={this.state.max_consentration}
                            fullWidth
                            onChange={this.props.handleChange('max_consentration')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="max_day_consentration"
                            value={this.state.max_day_consentration}
                            label="ПДК с.с."
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('max_day_consentration')}

                        />

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.handleDialogClose} color="primary">
                            Отмена
        </Button>
                        <Button onClick={this.props.handleAdd} color="primary">
                            Добавить
         </Button>
                    </DialogActions>
                </Dialog>
            </div>

        );
    }
}


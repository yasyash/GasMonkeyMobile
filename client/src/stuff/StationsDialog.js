
import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import isEmpty from 'lodash.isempty';

export default class FormDialog extends React.Component {
    constructor(props) {
        super(props);
        const { openDialog, title } = props;

        this.state = {
            openDialog, title: 'Введите данные станции наблюдения:'
        };
        if (!isEmpty(title)) this.state.title = title;
    };



    render() {
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
                        <TextField
                            autoFocus
                            margin="dense"
                            id="idd"
                            label="ID станции"
                            value={this.props.idd}
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('idd')}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="namestation"
                            label="Наименование станции"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('namestation')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="address"
                            label="Адрес подключения SOAP"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('address')}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="login"
                            label="Логин"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('login')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password_soap"
                            label="Пароль"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('password_soap')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="updateperiod"
                            label="Период опроса, сек."
                            type="text"
                            value={this.props.updateperiod}
                            fullWidth
                            onChange={this.props.handleChange('updateperiod')}

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

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
        const { openDialog, title, id_station } = props;

        this.state = { id_station };

        this.state = {
            openDialog, title: 'Введите данные REST API:'
        };
        if (!isEmpty(title)) this.state.title = title;
    };

    componentWillMount() {


        if (this.props.data)
            this.state = { id_station: this.props.data[0].idd };



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
                            type="text"
                            fullWidth
                            value = {this.state.id_station}
                            onChange={this.props.handleChange('idd')}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="indx"
                            label="Индекс станции"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('indx')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="uri"
                            label="API uri"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('uri')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="code"
                            label="Код станции"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('code')}



                        />

                        <TextField
                            autoFocus
                            margin="dense"
                            id="token"
                            label="Токен"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('token')}

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
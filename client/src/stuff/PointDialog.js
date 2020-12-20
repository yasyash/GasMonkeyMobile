
import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import isEmpty from 'lodash.isempty';

export default class PointDialog extends React.Component {
    constructor(props) {
        super(props);
        const { openDialog, title, lat, lon } = props;

        this.state = {
            openDialog, title: 'Введите данные точки наблюдения:'
        };
        if (!isEmpty(title)) this.state.title = title;
    };



    render() {
        const { lat, lon } = this.props;

        return (

            <div>
                <Dialog
                    open={this.props.openDialog}
                    onClose={this.handleDialogClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Введите данные</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {this.state.title}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="idd"
                            label="ID точки наблюдения"
                            value={this.props.idd}
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('idd')}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="descr"
                            label="Описание"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('descr')}

                        />
                         <TextField
                            autoFocus
                            margin="dense"
                            id="place"
                            label="Адрес"
                            type="text"
                            fullWidth
                            onChange={this.props.handleChange('place')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="lat"
                            label="Широта"
                            type="text"
                            value = {lat}
                            fullWidth
                            onChange={this.props.handleChange('lat')}

                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="lon"
                            label="Долгота"
                            type="text"
                            value = {lon}
                            fullWidth
                            onChange={this.props.handleChange('lon')}

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
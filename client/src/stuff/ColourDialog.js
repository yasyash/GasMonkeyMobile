
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
import { SketchPicker } from 'react-color';
import { EditableInput } from 'react-color/lib/components/common';

import $ from "jquery";


import isEmpty from 'lodash.isempty';
import shortid from 'shortid';
import reactCSS from 'reactcss'

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
const inputStyles = {
    input: {
        border: 0,
    },
    label: {
        fontSize: '12px',
        color: '#999',
    },
};

export default class ColourDialog extends React.Component {
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
            def_colour: 7799999,
            max_consentration,
            max_day_consentration,
            displayColorPicker: false

        };
        if (!isEmpty(title)) this.state.title = title;
    };

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange(color, event) {
        console.log(color);
        this.setState({ def_colour: color });
    }

    render() {
        const { id } = this.state;
        const styleP = reactCSS({
            'default': {
                color: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: this.state.def_colour
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'relative',
                    top: '170px',
                    right: '-90px',
                    bottom: '-70px',
                    left: '10px',
                },
            },
        });
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
 
                        <div>
                            <div style={styleP.swatch} onClick={this.handleClick}>
                                <div style={styleP.color} />
                            </div>
                            {this.state.displayColorPicker ? <div style={styleP.popover}>
                                <div style={styleP.cover} onClick={this.handleClose} />
                                <SketchPicker color={this.state.def_colour} onChange={this.handleChange} />
                            </div> : null}

                        </div>
                       

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


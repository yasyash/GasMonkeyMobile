import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import Icon from '@material-ui/core/Icon';

import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

import SvgIcon from '@material-ui/core/SvgIcon';

import Visibility from '@material-ui/icons/Visibility'
import PlayListAddCheck from '@material-ui/icons/PlaylistAddCheck';
import SupervisorButton from '@material-ui/icons/SupervisorAccount'

import DeleteForever from '@material-ui/icons/DeleteForever';
import Switch from '@material-ui/core/Switch';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

import CheckBox from '@material-ui/icons/CheckBox';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

import TextField from '@material-ui/core/TextField';


import { connect } from 'react-redux';

import isEmpty from 'lodash.isempty';





const ITEM_HEIGHT = 48;

//window.html2canvas = html2canvas;

const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
    },
    formControl: {
        margin: 2,
        minWidth: 160,
        padding: 0
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    icon: {
        margin: theme.spacing.unit * 2,
        color: blue[600],
        width: 30,
        height: 30,
        margin: 0
    },
    iOSSwitchBase: {
        '&$iOSChecked': {
            color: theme.palette.common.white,
            '& + $iOSBar': {
                backgroundColor: blue[600],
            },
        },
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.sharp,
        }),
    },
    iOSChecked: {
        transform: 'translateX(15px)',
        '& + $iOSBar': {
            opacity: 1,
            border: 'none',
        },
    },
    iOSBar: {
        borderRadius: 13,
        width: 42,
        height: 26,
        marginTop: -13,
        marginLeft: -21,
        border: 'solid 1px',
        borderColor: theme.palette.grey[400],
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(['background-color', 'border']),
    },
    iOSIcon: {
        width: 24,
        height: 24,
    },
    iOSIconChecked: {
        boxShadow: theme.shadows[1],
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 150,
    }, textFieldWide: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 180,
    },
    _td: { textAlign: 'center' },

    alert_macs1_ylw: {
        backgroundColor: '#ffff1a'
    },
    alert_macs5_orng: {
        backgroundColor: '#ff4d00'
    },

    alert_macs10_red: {
        backgroundColor: '#ff0000'
    },
    alert_success: {
        color: '#000000',
        backgroundColor: '#ffffff'
    },
    button: {
        margin: 0,
    },
    input: {
        display: 'none',
    }

});




class MenuUsersAdmin extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,

            isStation,
            isLoading,
            snack_msg,
            data_actual,
            type
        } = props;

        if (isStation) { isNll = true }

        this.state = {

            isStation: isNll,
            isLoading,
            snack_msg,
            anchorEl: null,
            data_actual,
            type

        };




        //this.handleClose = this.handleClose.bind (this);
        //this.handleClick = this.handleClick.bind (this);
        // this.handleChange = this.handleChange.bind (this);

    }

    daysInMonth = (month) => {
        let days = 33 - new Date(new Date().getFullYear(), month, 33).getDate();
        return days;

    };

    handleLocalChangeToggle = name => event => {
        // const{meteoOptions} = this.props;
        // const{options} = this.props;

        this.props.handleChangeToggle(name, event);
        // this.setState({meteoOptions});
        // this.setState({options});

    };


    handleUpdateClick = (name) => {
        this.props.handleUpdate();
    };
    handleDeleteClick = (name) => {

        this.props.handleDelete();
    };
    handleActivate = (name) => {
        this.props.handleActivate();
    }
    handleClose = () => {
        this.setState({ anchorEl: null });

    };

    handleSupervisor = (name) => {
        this.props.handleToggleSupervisor();
    }


    render() {
        const { classes } = this.props;


        return (
            <div>


                <Paper >

                    <nav className="navbar form-control">


                        <div className="navbar-header">
                            <Tooltip id="tooltip-charts-view3" title="Записать">
                                <IconButton className={classes.button} onClick={this.handleUpdateClick} aria-label="Записать">

                                    <Icon className={classes.icon} color="primary">
                                        < PlayListAddCheck />
                                    </Icon>
                                </IconButton>
                            </Tooltip>
                            <Tooltip id="tooltip-charts-view3" title="Активировать / деактивировать уч. запись">
                                <IconButton className={classes.button} onClick={this.handleActivate} aria-label="Активировать">

                                    <Icon className={classes.icon} color="primary">
                                        < Visibility />
                                    </Icon>
                                </IconButton>
                            </Tooltip>
                            <Tooltip id="tooltip-charts-view3" title="Права администратора для уч. запись">
                                <IconButton className={classes.button} onClick={this.handleSupervisor} aria-label="Права администратора">

                                    <Icon className={classes.icon} color="primary">
                                        < SupervisorButton />
                                    </Icon>
                                </IconButton>
                            </Tooltip>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <Tooltip id="tooltip-charts-view4" title="Удалить">
                                <IconButton className={classes.button} onClick={this.handleDeleteClick} aria-label="Удалить">

                                    <Icon className={classes.icon} color="primary">
                                        < DeleteForever />
                                    </Icon>
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className={classes.root}>



                        </div>


                        <Snackbar
                            open={this.props.isLoading}
                            // TransitionComponent={<Slider direction="up" />}
                            autoHideDuration={3000}
                            onClose={this.props.handleSnackClose}

                            message={<span id="message-id">{this.props.snack_msg}</span>}

                        />
                    </nav>
                </Paper> <br />
            </div >
        );
    }
}



function mapStateToProps(state) {
    return {
        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: state.showCheckboxes,
          height: state.height*/


    };
}

MenuUsersAdmin.propTypes = {

    classes: PropTypes.object.isRequired
}

export default (withStyles(styles)(MenuUsersAdmin));
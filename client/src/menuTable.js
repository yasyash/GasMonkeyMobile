import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import Settings from 'material-ui/svg-icons/action/settings';
import ContentFilter from 'material-ui/svg-icons/content/filter-list';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import Toggle from 'material-ui/Toggle';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { connect } from 'react-redux';

import { dateAddAction } from './actions/dateAddAction';
/**
 * Three controlled examples, the first allowing a single selection, the second multiple selections,
 * the third using internal state.
 */
const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '90%',
        align: 'center',
        backgroundColor: theme.palette.background.paper,
    },
    smallIcon: {
        width: 30,
        height: 30,
    },
    mediumIcon: {
        width: 48,
        height: 48,
    },
    largeIcon: {
        width: 60,
        height: 60,
    },
    small: {
        width: 30,
        height: 30,
        padding: 1,
    },
    medium: {
        width: 96,
        height: 96,
        padding: 24,
    },
    large: {
        width: 120,
        height: 120,
        padding: 30,
    },
    propContainer: {
        width: '80%',
        overflow: 'hidden',
        margin: '20px auto 0',
    },
    propToggleHeader: {
        margin: '20px auto 10px',
    },
    menuContainer: {
        width: '95%',
        overflow: 'hidden',
        margin: '20px auto 0',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: '0',
        marginRight: '0',
        width: ' 200px '
    }
});


class MenuTable extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height,
            isStation,
            isLoading,
            snack_msg,
            dateTimeBegin,
            dateTimeEnd,
            isSensor,
            defaultPageSize,
            hideFiltartion
        } = props;

        if (isStation) { isNll = true }
        // if (!isSensor) { isSensor = false }

        this.state = {
            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            isEdit: false,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height,
            isStation: isNll,
            isLoading,
            snack_msg,
            dateTimeBegin,
            dateTimeEnd,
            isSensor,
            defaultPageSize,
            hideFiltartion,

        };



        this.handleChangeMultiple = this.handleChangeMultiple.bind(this);
        this.handleChangeSingle = this.handleChangeSingle.bind(this);
        this.handleOnRequestChange = this.handleOnRequestChange.bind(this);
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        // this.handleClose = this.handleClose.bind (this);

    }

    handleChangeSingle(event, value) {
        this.setState({
            valueSingle: value,
        });
    };

    handleChangeMultiple(event, value) {
        this.setState({
            valueMultiple: value,
        });
    };

    handleOpenMenu() {
        this.setState({
            openMenu: true,
        });
    }

    handleOnRequestChange(value) {
        this.setState({
            openMenu: value,
        });
    }
    handleTableUpdate(stateValue) {
        this.setState({
            nameFilter: stateValue
        })
    }
    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });
        this.props.handleToggle(event, toggled);

        if ((event.target.name === 'selectable') ||
            (event.target.name === 'multiSelectable') ||
            (event.target.name === 'enableSelectAll')) {

            if (!this.state.showCheckboxes) {
                event.target.name = 'showCheckboxes'
                this.props.handleToggle(event, toggled);
                this.setState({
                    showCheckboxes: toggled
                });
            }
        }
    };

    handleChange(name, event) {
        this.setState({ [name]: event.target.value });
        this.props.handleChange(name, event.target.value);

    };
    handleRefresh = name => event => {
        // let { state } = this;
        this.props.handleClick();
    };

    handlePickerChange = (event) => {
        const value = event.target.value;
        const id = event.target.id;

        dateAddAction({ [id]: value });
    };

handleEdit (event, toggled)
{
    this.setState({
        [event.target.name]: toggled
    });
    this.props.handleToggleEdit(event, toggled);

};

    render() {

        const { classes } = this.props;

        /*let { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height
        } = this.props;*/
        return (
            //<Paper className={classes.root}>

            <nav className="navbar form-control classes.container">
                <div className="navbar-header">
                    <IconButton
                        iconStyle={styles.smallIcon}
                        style={styles.small} tooltip={'Обновить'}
                        onClick={this.handleRefresh('all')} //fake parameter for return function call
                    >
                        <Renew />

                    </IconButton>

                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {(this.state.isSensor) && '  данные с:    '}
                    {(this.state.isSensor) && <TextField
                        id="dateTimeBegin"
                        label="начало периода"
                        type="datetime-local"
                        defaultValue={this.props.dateTimeBegin}
                        className={classes.textField}
                        // selectProps={this.state.dateTimeBegin}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {(this.state.isSensor) && '  по:     '}
                    {(this.state.isSensor) && <TextField
                        id="dateTimeEnd"
                        label="конец периода"
                        type="datetime-local"
                        defaultValue={this.props.dateTimeEnd}
                        className={classes.textField}
                        // SelectProps ={this.state.dateTimeEnd}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />}
                </div>

                <div className="navbar-right">

                    <IconMenu
                        iconButtonElement={<IconButton iconStyle={styles.smallIcon}
                            style={styles.small} tooltip={'Cервис таблиц'}>
                            <Settings />
                        </IconButton>}
                        onChange={this.handleChangeSingle}
                        value={this.state.valueSingle}
                    >

                        <div className="form-control " style={styles.menuContainer}>
                            <Toggle
                                name="isEdit"
                                label="Редактировать данные"
                                onToggle={this.handleEdit}
                                defaultToggled={this.state.isEdit}
                            />
                            <Toggle
                                name="stripedRows"
                                label="Черно-белый стиль"
                                onToggle={this.handleToggle}
                                defaultToggled={this.state.stripedRows}
                            />
                        </div>
                        <div className="form-control " style={styles.menuContainer}>
                            <div style={styles.propContainer} >

                                <h6>Настройка таблицы</h6>

                                <TextField
                                    label="Высота окна таблицы"
                                    defaultValue={this.state.height}
                                    onChange={(event) => this.handleChange(name = 'height', event)}
                                /><br />
                                <TextField
                                    label="Записей на странице таблицы"
                                    defaultValue={this.state.defaultPageSize}
                                    onChange={(event) => this.handleChange(name = 'defaultPageSize', event)}
                                />

                            </div>
                        </div>


                    </IconMenu>

                </div>
                <Snackbar
                    open={this.props.isLoading}
                    // TransitionComponent={<Slider direction="up" />}
                    autoHideDuration={4000}
                    onClose={this.props.handleClose}

                    message={<span id="message-id">{this.props.snack_msg}</span>}

                />
            </nav>
            //</Paper>
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

MenuTable.propTypes = {

    classes: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired
}

export default connect(null, { dateAddAction })(withStyles(styles)(MenuTable));
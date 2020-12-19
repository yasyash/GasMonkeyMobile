import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';

import TxtFieldGroup from './stuff/txtField';
import MenuAdmin from './MenuAdmin';
import TableSensors from './TableSensors';
import TableData from './TableData';

import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from 'material-ui/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';


import ReactTable from "react-table";
import checkboxHOC from "react-table/lib/hoc/selectTable";
import "react-table/react-table.css";
import isEmpty from 'lodash.isempty';
import { getApi, updateApi, deleteApi, insertApi} from './actions/adminActions';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import shortid from 'shortid';
//import './Table.css';
//import './css/rwd-table.css';


import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import ApiDialog from './stuff/ApiDialog';

import PlayListAdd from '@material-ui/icons/PlaylistAdd';
import Icon from '@material-ui/core/Icon';

const CheckboxTable = checkboxHOC(ReactTable);

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
});



class ApiForm extends React.Component {
    constructor(props) {
        super(props);
        const {


            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            height,
            station_actual,
            stationsList,
            sensorsList,
            dataList,
            dateTimeBegin,
            dateTimeEnd,
            api_list


        } = props;



        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,

            dateTimeBegin, //new Date().format('Y-MM-dd') + 'T00:00',
            dateTimeEnd, //new Date().format('Y-MM-ddTH:mm'),
            api_actual: '',
            sensors_actual: [],
            stationsList,
            sensorsList,
            dataList,
            selected: [],

            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes: true,
            height: '300px',

            selection: '',
            selectAll: false,

            isUpdated: false,
            api_list,
            openDialog: false,
            address: '',
            username: '',
            pwd: '',
            periods: 1200,
            idd:'',
            index:'',
            uri:'',
            code:'',
            token:''

        };


        this.renderEditable = this.renderEditable.bind(this);

    }

    handleFTP() {
        if (!isEmpty(this.state.api_actual)) {
            this.props.sendFtp(this.state.api_actual);
        }
    };

    setData(data_in) {
        const data = data_in.map(item => {
            const _id = shortid.generate();


            Object.assign(item, { _id: _id });
            return item;
        });
        return data;
    }

    toggleSelection(key, shift, row) {
        /*
          Implementation of how to manage the selection state is up to the developer.
          This implementation uses an array stored in the component state.
          Other implementations could use object keys, a Javascript Set, or Redux... etc.
        */
        // start off with the existing state
        // let selection = this.state.selection;

        // const keyIndex = selection.indexOf(key);
        // check to see if the key exists
        // if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        //    selection = [
        //       ...selection.slice(0, keyIndex),
        //       ...selection.slice(keyIndex + 1)
        //  ];
        //  if (row.id == this.state.api_actual) {
        //       this.setState({ api_actual: '' });
        //  };

        // } else {
        // it does not exist so add it
        //ONLY ON ROW MAY BE SELECTED
        // selection = key;
        this.setState({ api_actual: row.id });

        //}
        // update the state
        this.setState({ selection: key });
    };

    toggleAll() {
        /*
          'toggleAll' is a tricky concept with any filterable table
          do you just select ALL the records that are in your data?
          OR
          do you only select ALL the records that are in the current filtered data?
          
          The latter makes more sense because 'selection' is a visual thing for the user.
          This is especially true if you are going to implement a set of external functions
          that act on the selected information (you would not want to DELETE the wrong thing!).
          
          So, to that end, access to the internals of ReactTable are required to get what is
          currently visible in the table (either on the current page or any other page).
          
          The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
          ReactTable and then get the internal state and the 'sortedData'. 
          That can then be iterrated to get all the currently visible records and set
          the selection state.
        */
        const selectAll = this.state.selectAll ? false : true;
        const selection = [];
        if (selectAll) {
            // we need to get at the internals of ReactTable
            const wrappedInstance = this.checkboxTable.getWrappedInstance();
            // the 'sortedData' property contains the currently accessible records based on the filter and sort
            const currentRecords = wrappedInstance.getResolvedState().sortedData;
            // we just push all the IDs onto the selection array
            currentRecords.forEach(item => {
                selection.push(item._original._id);
            });
        }
        this.setState({ selectAll, selection });
    };

    isSelected(key) {
        /*
          Instead of passing our external selection state we provide an 'isSelected'
          callback and detect the selection state ourselves. This allows any implementation
          for selection (either an array, object keys, or even a Javascript Set object).
        */
        return this.state.selection.includes(key);
    };

    //// end of table fuctions

    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });
    };



    handleChange(event) {
        this.setState({ height: event.target.value });
    };

    handleRowSelection(selectedRows) {
        let ftp = (this.state.api_list[selectedRows].id);

        this.setState({
            selected: selectedRows,
            api_actual: ftp
        });
    };

    //  isSelected(index) {
    //      return this.state.selected.indexOf(index) !== -1;
    //  };
    handleClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };


    ////////////

    onSubmit(e) {
        e.preventDefault();

        alert('OK');

        //   this.props.createMyEvent(this.state);
    };

    handleClick() {

        //e.preventDefault();

        this.loadData(1).then(data => {
            if (data) {
                this.loadData(3);
                // this.setState({ sensorsList: this.setData(data) })
                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
                this.setState({ isUpdated: true });

            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            }
        });

        //alert('loadData');

        //   this.props.createMyEvent(this.state);
    };

    renderEditable(cellInfo) {
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.api_list];
                    data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                    this.setState({ api_list: data });
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.api_list[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    } I

    async    load_api() {
        let params = {};
        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        //3 - macs table

        let data = await (this.props.getApi());
        //console.log(data);
        return data;
    };

    handleSnackClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };

    handleUpdate() {
        if (!isEmpty(this.state.api_actual)) {
            const { api_list } = this.state;
            let filter = api_list.filter((item, i, arr) => {
                return item.id == this.state.api_actual;
            });
            this.props.updateApi(filter).then(resp => {
                if (resp.status == 200) {
                    this.load_api().then(data => {
                        if (data)
                            this.setState({ api_list: data });
                        this.setState({ api_actual: '' });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Данные успешно обновлены...' });
                    });
                } else {
                    this.setState({ isLoading: true });
                    this.setState({ snack_msg: 'Ошибка сервера...' });
                };
            });
        }
    }

    handleDelete() {
        if (!isEmpty(this.state.api_actual)) {
            var isReal = confirm("Вы уверены?...");

            if (isReal) {
                this.props.deleteApi(this.state.api_actual).then(resp => {
                    if (resp.status == 200) {
                        this.load_api().then(data => {
                            if (data)
                                this.setState({ api_list: data });
                            this.setState({ api_actual: '' });

                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Данные удалены...' });
                        });
                    } else {
                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Ошибка сервера...' });
                    };
                });
            };
        }
    }

    handleDialogAdd() {
        this.setState({ openDialog: true });

    }

    handleDialogClose() {
        this.setState({ openDialog: false });
    };

    handleChange = name => event => {
        //getFTPFunc
        this.setState({
            [name]: event.target.value,
        });
    };

    handleAdd() {            

        //insert action
        let { idd, index, code, token, uri } = this.state;
        this.props.insertApi({ idd, index, code, token, uri })
            .then(resp => {
                this.setState({ openDialog: false });

                if (resp.status == 200) {
                    this.load_api().then(data => {
                        if (data)
                            this.setState({ api_list: data });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Данные успешно добавлены...' });

                    });
                } else {
                    this.setState({ isLoading: true });
                    this.setState({ snack_msg: 'Ошибка сервера...' });
                };
            });;


    };

    handleActivate() {
        if (!isEmpty(this.state.api_actual)) {
            const { api_list } = this.state;
            let filter = api_list.filter((item, i, arr) => {
                return item.id == this.state.api_actual;
            });
            Object.assign(filter[0], {is_present: true});
            this.props.updateApi(filter).then(resp => {
                if (resp.status == 200) {
                    this.load_api().then(data => {
                        if (data)
                            this.setState({ api_list: data });
                        this.setState({ api_actual: '' });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'API успешно активирована...' });
                    });
                } else {
                    this.setState({ isLoading: true });
                    this.setState({ snack_msg: 'Ошибка сервера...' });
                };
            });
        }
    };

    
    componentWillMount() {


        this.load_api().then(data => {
            if (data)
                this.setState({ api_list: data });
        });





    };


    render() {
        const { api_list } = this.state;
        const { snack_msg, isLoading } = this.state;

        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, height } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        // var tableData = this.state.stationsList;
        // const { title, errors, isLoading } = this.state;
        //const {handleChange, handleToggle} = this.props;
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
        const checkboxProps = {
            selection,
            selectAll: false,
            isSelected: isSelected.bind(this),
            toggleSelection: toggleSelection.bind(this),
            selectType: "checkbox",
            getTrProps: (s, r) => {
                let selected = false;
                // someone asked for an example of a background color change
                // here it is...
                if (r) {
                    selected = this.isSelected(r.original._id);
                }
                return {
                    style: {
                        backgroundColor: selected ? "lightblue" : "inherit"
                        // color: selected ? 'white' : 'inherit',
                    }
                };
            }
        };

        const Tips = () =>
            <div style={{ textAlign: "center" }}>
                <em>Для сортировки по нескольким полям удерживайте клавишу Shift!</em>
            </div>;
        const Title = [
            {
                Header: "Перечень REST Api",
                columns: [
                    {
                        Header: "ID станции",
                        id: "idd",
                        accessor: "idd",
                        Cell: this.renderEditable,
                        filterable: true

                    },
                    {
                        Header: "Индекс станции",
                        id: "indx",
                        accessor: d => d.id,
                        Cell: this.renderEditable,
                        filterable: true

                    },

                    {
                        Header: "Адрес uri",
                        id: "uri",
                        accessor: "uri",
                        accessor: d => d.id,
                        Cell: this.renderEditable,
                        filterable: true

                    },
                    {
                        Header: "Токен",
                        id: "token",
                        accessor: "token",
                        Cell: this.renderEditable,
                        filterable: true

                    },
                    {
                        Header: "Код станции",
                        id: "code",
                        accessor: "code",
                        Cell: this.renderEditable

                    },


                    {
                        Header: "Время репликации",
                        id: "last_time",
                        accessor: "last_time",
                        Cell: this.renderEditable,

                    },
                    {
                        Header: "Время последних данных",
                        id: "date_time",
                        accessor: "date_time",
                        Cell: this.renderEditable,

                    },
                    {
                        Header: "ID сообщения",
                        id: "msg_id",
                        accessor: "msg_id",


                    },
                    {
                        Header: "ID записи",
                        id: "id",
                        accessor: "id",


                    },
                    {
                        Header: "Включена",
                        id: "is_present",
                        accessor: "is_present",


                    }


                ]
            }
        ]


        return (


            <Paper className={classes.root}>
                <br />
                <MenuAdmin
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading} type='API'
                    handleActivate={this.handleActivate.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}
                    handleUpdate={this.handleUpdate.bind(this)}
                    handleDelete={this.handleDelete.bind(this)}
                    handleDialogAdd={this.handleDialogAdd.bind(this)}
                    data_actual={this.state.api_actual}
                />


                <ApiDialog openDialog={this.state.openDialog}
                    id_station={this.state.api_list ? this.state.api_list[0].idd : ''}
                    handleDialogClose={this.handleDialogClose.bind(this)}
                    handleAdd={this.handleAdd.bind(this)}
                    handleChange={this.handleChange.bind(this)} />


                <div >
                    <CheckboxTable
                        ref={r => (this.checkboxTable = r)}
                        {...checkboxProps}
                        data={api_list}
                        columns={Title}
                        defaultPageSize={7}
                        previousText={'Предыдущие'}
                        nextText={'Следующие'}
                        loadingText={'Loading...'}
                        noDataText={'Записей не найдено'}
                        pageText={'Страница'}
                        ofText={'из'}
                        rowsText={'записей'}
                        style={{
                            height: height + 100 // This will force the table body to overflow and scroll, since there is not enough room
                        }}
                        className="-striped -highlight"
                        {...this.state}
                    />
                    <br />
                    <Tips />
                </div>



            </Paper >
        );
    }
}

function mapStateToProps(state) {
    let station = '';
    if (state.activeStationsList[0]) { station = state.activeStationsList[0].station }
    return {

        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: stFapi_ate.showCheckboxes,*/
        //sensorsList: state.sensorsList
        station_actual: station,
        dateTimeBegin: state.datePickers.dateTimeBegin,
        dateTimeEnd: state.datePickers.dateTimeEnd

    };
}


ApiForm.propTypes = {
    getApi: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
}

ApiForm.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(null, {
    getApi, updateApi, deleteApi, insertApi
})(withRouter(withStyles(styles)(ApiForm)));
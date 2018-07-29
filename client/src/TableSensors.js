import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';
import isEmpty from 'lodash.isempty';


import TxtFieldGroup from './stuff/txtField';
import { queryEvent } from './actions/queryActions';
import MenuTable from './menuTable';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';

import { addActiveSensorsList, deleteActiveSensorsList } from './actions/sensorsAddAction';
import { addActiveStationsList, deleteActiveStationsList, getFirstActiveStationsList } from './actions/stationsAddAction';

import ReactTable from "react-table";

import checkboxHOC from "react-table/lib/hoc/selectTable";
import FoldableTableHOC from '../foldableTable/index';
import 'react-table/react-table.css';

Object.assign(ReactTable, {
    previousText: 'Предыдущие',
    nextText: 'Следующие',
    loadingText: 'Loading...',
    noDataText: 'Записей не найдено',
    pageText: 'Страница',
    ofText: 'из',
    rowsText: 'записей',
    className: "-striped -highlight"

});


const CheckboxTable = checkboxHOC(ReactTable);



const FoldableTable = FoldableTableHOC(CheckboxTable);

import shortid from 'shortid';



class TableSensors extends React.Component {
    constructor(props) {
        super(props);
        const {
            queryEvent,

            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            station_actual,
            stationsList,
            sensorsList,
            dataList,

            dateTimeBegin,
            dateTimeEnd,
            sensors_actual,
            snack_msg,
            selection

        } = props;


        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,

            dateTimeBegin,
            dateTimeEnd,
            station_actual,
            stationsList,
            sensorsList,
            dataList,
            selected: [],
            sensors_actual,

            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height: '400px',

            selection,
            selectAll: false,
            isSensor: true
        };

        // this.onClick = this.onRefresh.bind(this);

        // this.onSubmit = this.onSubmit.bind(this);

    }
    // this.onChange = this.onChange.bind(this);
    // this.onChange = this.onChange.bind(this);

    // this.handleToggle = this.handleToggle.bind(this);
    //this.handleChange = this.handleChange.bind(this);

    /// begin of table functions
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
        // start off with the existing state - sensors
        let selection = [...this.state.selection];
        let sensors_actual = [...this.state.sensors_actual];

        const keyIndex = selection.indexOf(key);
        // check to see if the key exists
        if (keyIndex >= 0) {
            // it does exist so we will remove it using destructing
            selection = [
                ...selection.slice(0, keyIndex),
                ...selection.slice(keyIndex + 1)
            ];
            sensors_actual = [
                ...sensors_actual.slice(0, keyIndex),
                ...sensors_actual.slice(keyIndex + 1)
            ];
        } else {
            // it does not exist so add it
            selection.push(key);
            sensors_actual.push(row.serialnum);
        }
        // update the state
        this.setState({ selection, sensors_actual });
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
            const wrappedInstance = this.FoldableTable.getWrappedInstance();
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


    //}

    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });
    };



    handleChange(event) {
        this.setState({ height: event.target.value });
    };

    ////////////
    handleRowSelection(selectedRows) {
        let id_sensor = (this.props.sensorsList[selectedRows].id);

        this.setState({
            selected: selectedRows,
            sensors_actual: id_sensor
        });
    };



    onSubmit(e) {
        e.preventDefault();
        //   this.props.createMyEvent(this.state);
    };

    handleClick() {
        let params = {};
        //e.preventDefault();
        this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));


        // 0 - all stations, 1- all sensors of the station, 2 - selected sensors
        if (!isEmpty(this.state.sensors_actual)) {
            params.period_from = this.props.dateTimeBegin;
            params.period_to = this.props.dateTimeEnd;


            params.station = this.props.station_actual;
            params.sensors = this.state.sensors_actual;
            this.props.queryEvent(params).then(data => {
                if (data) {
                    this.setState({ dataList: data })
                    this.setState({ isLoading: true })
                    this.setState({ snack_msg: 'Данные успешно загружены...' })
                    // addActiveSensorsList(this.state.selection);
                    getFirstActiveStationsList();
                    addActiveStationsList({ sensors: this.state.selection });

                }
                else {
                    this.setState({ isLoading: false })
                    this.setState({ snack_msg: 'Данные отсутствуют...' })

                }
            });
        }
        //this.props.loadData(2).then(data => this.setState({ dataList: this.setData(data) }));
        //alert('load Data');

        //   this.props.createMyEvent(this.state);
    };
    handleClose() {
        this.setState({ isLoading: false });
    };
    //onChange(e) {
    //  this.setState({ [e.target.name]: e.target.value });
    //}
    componentWillMount() {
        const getSensors = this.props.sensorsList;
        let sensors_actual = [];
        let selection = [];

        this.setState({ selection: [] });

        //this.setState({ stationsList: getStations });
        // this.loadData().then(data => this.setState({ stationsList: data }));
        //  this.loadData().then(data => this.setState({ stationsList: data }));
        // this.loadData().then(data => this.setState({ stationsList: data }));
        if (this.props.sensorsList.length > 0) {
            getSensors.forEach(element => {
                if (this.props.selection.indexOf(element._id) > -1) {
                    sensors_actual.push(element.serialnum);
                    selection.push(element._id);
                };
            });
            this.setState({ sensors_actual, selection });
        };

    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.station_actual) {
            if (this.props.station_actual !== nextProps.station_actual) {
                this.setState({ selection: '' });
                this.setState({ sensors_actual: '' });
            } else {
                if ((!this.props.isUpdated) && (nextProps.isUpdated)) {

                    this.setState({ selection: '' });
                    this.setState({ sensors_actual: '' });

                };
            };

        };


    };


    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, height } = this.state;
        const { sensorsList } = this.props;

        const checkboxProps = {
            selection,
            selectAll,
            isSelected: isSelected.bind(this),
            toggleSelection: toggleSelection.bind(this),
            toggleAll: toggleAll.bind(this),
            selectType: "checkbox",
            className: "-striped -highlight",
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

        const Title =



            [{
                Header: "Тип",
                id: "typemeasure",
                accessor: "typemeasure"
            },
            {
                Header: "Макс. показатель",
                id: "max_consentration",
                accessor: "max_consentration",
                foldable: true
            },
            {
                Header: "Макс. сут. показатель",
                id: "max_day_consentration",
                accessor: "max_day_consentration",
                foldable: true
            },
            {
                Header: "Ед. измерения",
                id: "unit_name",
                accessor: "unit_name",
                foldable: true
            }, {
                Header: "Время наблюдения",
                id: "date_time_out",
                accessor: "date_time_out",
                foldable: true,
                folded: true
            },
            {
                Header: "ID датчика",
                id: "serialnum",
                foldable: true,
                accessor: d => d.serialnum,
                folded: true
            },

            {
                Header: "Начало наблюдений",
                id: "date_time_in",
                accessor: "date_time_in",
                foldable: true,
                folded: true
            },
            {
                Header: "Период усреднения",
                id: "average_period",
                accessor: "average_period",
                foldable: true,
                folded: true
            },

            {
                Header: "Цвет линии на графике",
                id: "def_colour",
                accessor: "def_colour",
                foldable: true,
                folded: true
            }];
            
        return (


            <div >
                <br />
                <MenuTable {...this.state} handleToggle={this.handleToggle.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                    handleClick={this.handleClick.bind(this)}
                    handleClose={this.handleClose.bind(this)}
                />
                <br />
                <FoldableTable
                    ref={r => (this.FoldableTable = r)}
                    data={sensorsList}
                    columns={Title}
                    {...checkboxProps}
                    defaultPageSize={20}
                    previousText={'Предыдущие'}
                    nextText={'Следующие'}
                    loadingText={'Loading...'}
                    noDataText={'Записи не загружены...'}
                    pageText={'Страница'}
                    ofText={'из'}
                    rowsText={'записей'}
                    style={{
                        height: height // This will force the table body to overflow and scroll, since there is not enough room
                    }}
                    className="-striped -highlight"
                    {...this.state}


                />
                <br />
                <Tips />

            </div>
        );
    }
}

function mapStateToProps(state) {
    let sensors = '';
    let station = '';
    let tmp = '';
    if (state.activeStationsList[1]) {
        tmp = state.activeStationsList.slice(state.activeStationsList.length - 1, );
        sensors = tmp[0].sensors;

    };

    if (state.activeStationsList[0]) {
        tmp = state.activeStationsList.slice(0, 1);
        station = tmp[0].station;

    };
    return {

        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: state.showCheckboxes,*/
        //height: state.height

        sensorsList: state.activeSensorsList,
        selection: sensors,
        station_actual: station,
        dateTimeBegin: state.datePickers.dateTimeBegin,
        dateTimeEnd: state.datePickers.dateTimeEnd


    };
}


TableSensors.propTypes = {
    queryEvent: PropTypes.func.isRequired,
    addActiveSensorsList: PropTypes.func.isRequired,
    addActiveStationsList: PropTypes.func.isRequired,
    getFirstActiveStationsList: PropTypes.func.isRequired
    //loadData: PropTypes.func.isRequired
}

TableSensors.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, {
    queryEvent, addActiveSensorsList, addActiveStationsList,
    getFirstActiveStationsList
})(withRouter(TableSensors));
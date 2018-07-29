import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';
//import store from './reducers/rootReducer';

import TxtFieldGroup from './stuff/txtField';
import { queryMeteoEvent } from './actions/queryActions';
import MenuTable from './menuTable';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';


import ReactTable from "react-table";
import FoldableTableHOC from '../foldableTable/index';
import 'react-table/react-table.css';

import shortid from 'shortid';

import checkboxHOC from "react-table/lib/hoc/selectTable";
const CheckboxTable = checkboxHOC(ReactTable);
Object.assign(CheckboxTable, {
    previousText: 'Предыдущие',
    nextText: 'Следующие',
    loadingText: 'Loading...',
    noDataText: 'Записей не найдено',
    pageText: 'Страница',
    ofText: 'из',
    rowsText: 'записей',
});


const FoldableTable = FoldableTableHOC(CheckboxTable);


class MeteoData extends React.Component {
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
            sensors_actual,
            stationsList,
            sensorsList,
            dataList,

            dateTimeBegin,
            dateTimeEnd,
            title

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
            height: '700px',

            selection: [],
            selectAll: false
        };


        this.onSubmit = this.onSubmit.bind(this);
    }
    // this.onChange = this.onChange.bind(this);
    // this.onChange = this.onChange.bind(this);

    // this.handleToggle = this.handleToggle.bind(this);
    //this.handleChange = this.handleChange.bind(this);

    /// begin of table functions
    setData(data_in) {
        const data = data_in.map(item => {
            const _id = shortid.generate();


            Object.assign(item, {});
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
        let selection = [...this.state.selection];

        const keyIndex = selection.indexOf(key);
        // check to see if the key exists
        if (keyIndex >= 0) {
            // it does exist so we will remove it using destructing
            selection = [
                ...selection.slice(0, keyIndex),
                ...selection.slice(keyIndex + 1)
            ];
        } else {
            // it does not exist so add it
            selection.push(key);
        }
        // update the state
        this.setState({ selection, station_actual: row.id });
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

    handleClick(e) {

        //e.preventDefault();

        //this.loadData().then(data => this.setState({ sensorsList: data }));

     //   alert('Nothing');

        //   this.props.createMyEvent(this.state);
    };

    //onChange(e) {
    //  this.setState({ [e.target.name]: e.target.value });
    //}
    componentWillMount() {
        //const getStations = this.props.queryEvent(this.state);
        //this.setState({ stationsList: getStations });
        // this.loadData().then(data => this.setState({ stationsList: data }));
        //  this.loadData().then(data => this.setState({ stationsList: data }));
        // this.loadData().then(data => this.setState({ stationsList: data }));


    };

    render() {
        //let dataList = [555];
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, height } = this.state;
        const dataList = this.props.dataList;
        //const { title } = this.props;
        // let lists={};
        //     console.log('dataList ', dataList);
        const checkboxProps = {
            data: dataList,
            selection,
            selectAll,
            isSelected: isSelected.bind(this),
            toggleSelection: toggleSelection.bind(this),
            toggleAll: toggleAll.bind(this),
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


        const title =             [{
                    Header: "ID станции",
                    id: "station",
                    accessor: d => d.id
                },
                               {
                    Header: "Время измерения",
                    id: "date_time",
                    accessor: "date_time"
                },
                {
                    Header: "Внешняя температура",
                    id: "temp_out",
                    accessor: "temp_out",
                    foldable: true
                },
                {
                    Header: "Макс. значение темп.",
                    id: "temp_hi",
                    accessor: "temp_hi",
                    foldable: true
                },
                {
                    Header: "Мин. значение темп.",
                    id: "temp_low",
                    accessor: "temp_low",
                    foldable: true
                },
                {
                    Header: "Влажность внешняя",
                    id: "hum_out",
                    accessor: "hum_out",
                    foldable: true
                },
                {
                    Header: "Точка росы",
                    id: "dew_pt",
                    accessor: "dew_pt",
                    foldable: true
                },
                {
                    Header: "Скор. ветра (м/с)",
                    id: "speed_wind",
                    accessor: "speed_wind",
                    foldable: true
                },
                {
                    Header: "Направление",
                    id: "dir_wind",
                    accessor: "dir_wind",
                    foldable: true
                },
                {
                    Header: "Пробег ветра,км.",
                    id: "run_wind",
                    accessor: "run_wind",
                    foldable: true
                },
                {
                    Header: "Макс. скор.",
                    id: "speed_wind_hi",
                    accessor: "speed_wind_hi",
                    foldable: true
                },
                {
                    Header: "Преимущ. напр.",
                    id: "dir_wind_hi",
                    accessor: "dir_wind_hi",
                    foldable: true
                },
                {
                    Header: "Температура на ветру",
                    id: "chill_wind",
                    accessor: "chill_wind",
                    foldable: true
                },
                {
                    Header: "Тепловой индекс,C",
                    id: "heat_indx",
                    accessor: "heat_indx",
                    foldable: true
                },
                {
                    Header: "Темп.-влажн. индекс",
                    id: "thw_indx",
                    accessor: "thw_indx",
                    foldable: true
                },
                {
                    Header: "Темп.-солн.-влажн. индекс",
                    id: "thsw_indx",
                    accessor: "thsw_indx",
                    foldable: true
                },
                {
                    Header: "Давление",
                    id: "bar",
                    accessor: "bar",
                    foldable: true
                },
                {
                    Header: "Осадки, мм",
                    id: "rain",
                    accessor: "rain",
                    foldable: true
                },
                {
                    Header: "Интенсивн. осадков",
                    id: "rain_rate",
                    accessor: "rain_rate",
                    foldable: true
                },
                {
                    Header: "Солн. радиация",
                    id: "rad_solar",
                    accessor: "rad_solar",
                    foldable: true
                },
                {
                    Header: "Солн. энерг.",
                    id: "enrg_solar",
                    accessor: "enrg_solar",
                    foldable: true
                },
                {
                    Header: "Солн. рад. макс.",
                    id: "rad_solar_hi",
                    accessor: "rad_solar_hi",
                    foldable: true
                },
                {
                    Header: "УФ-индекс",
                    id: "uv_indx",
                    accessor: "uv_indx",
                    foldable: true
                },
                {
                    Header: "Доза УФ",
                    id: "uv_dose",
                    accessor: "uv_dose",
                    foldable: true
                },
                {
                    Header: "УФ индекс макс.",
                    id: "uv_hi",
                    accessor: "uv_hi",
                    foldable: true
                },
                {
                    Header: "Внутр. темп.,С",
                    id: "temp_in",
                    accessor: "temp_in",
                    foldable: true
                },
                {
                    Header: "Влажн. внутр.",
                    id: "hum_in",
                    accessor: "hum_in",
                    foldable: true
                },
                {
                    Header: "Внутр. точка росы",
                    id: "dew_in",
                    accessor: "dew_in",
                    foldable: true
                },
                {
                    Header: "Внутр. тепл. индекс",
                    id: "emc_in",
                    accessor: "emc_in",
                    foldable: true
                },
                {
                    Header: "Влагосодержание внутр.",
                    id: "et",
                    accessor: "et",
                    foldable: true
                },
                {
                    Header: "Плотн. возд. внутр.",
                    id: "density_air_in",
                    accessor: "density_air_in",
                    foldable: true
                }
                ]
            

        return (


            <div>
                <br />
                <MenuTable {...this.state} handleToggle={this.handleToggle.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                    handleClick={this.handleClick.bind(this)}
                    height={this.state.height}
                />
                <br />
                <FoldableTable
                    ref={r => (this.checkboxTable = r)}
                    data={dataList}
                    columns={title}
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

                    {...this.props}
                />
                <br />
                <Tips />

            </div>
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
          showCheckboxes: state.showCheckboxes,*/
        dataList: state.meteoList,

    };
}


MeteoData.propTypes = {
    queryMeteoEvent: PropTypes.func.isRequired,
}

MeteoData.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryMeteoEvent })(withRouter(MeteoData));
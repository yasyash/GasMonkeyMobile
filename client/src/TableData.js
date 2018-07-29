import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';
//import store from './reducers/rootReducer';

import TxtFieldGroup from './stuff/txtField';
import { queryEvent } from './actions/queryActions';
import MenuTable from './menuTable';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';


import ReactTable from "react-table";

import checkboxHOC from "react-table/lib/hoc/selectTable";
import FoldableTableHOC from '../foldableTable/index';
import shortid from 'shortid';



import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

import { withStyles } from '@material-ui/core/styles';



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

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    menu: {
        width: 200,
    },
});


class TableData extends React.Component {
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
            multiSelectable: true,
            enableSelectAll: true,
            deselectOnClickaway,
            showCheckboxes,
            height: '600px',

            selection: [],
            selectAll: false
        };


        //  this.onSubmit = this.onSubmit.bind(this);
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

    handleClick(e) {

        //e.preventDefault();

        //this.loadData().then(data => this.setState({ sensorsList: data }));

        alert('Nothing');

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
        const { classes } = this.props;

        //let dataList = [555];
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, height } = this.state;
        const dataList = this.props.dataList.slice(1, );
        const { title } = this.props;
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
                    ref={r => (this.FoldableTable = r)}
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

function mapStateToProps(state, ownProps) {
    //let title = [];
    //if (state.sensorsList.length == 1) {
    let title = [{
        Header: "Время наблюдения",
        id: "date_time",
        accessor: "date_time"
    }, {
        Header: "Тип",
        id: "typemeasure",
        accessor: "typemeasure"
    },
    {
        Header: "Значение",
        id: "measure",
        accessor: "measure"
    },
    {
        Header: "Единицы",
        id: "unit_name",
        accessor: "unit_name"
    },

    {
        Header: "ID датчика",
        id: "serialnum",
        accessor: d => d.serialnum,
        foldable: true,
        folded: true

    },
    {
        Header: "Тревога",
        id: "is_alert",
        accessor: "is_alert",
        foldable: true

    }]


    //};

    if (state.sensorsList.length > 1) {

        let _header = state.dataList[0];
        let columns = [];
        for (var key in _header) {
            if (key !== '_id') {
                columns.push({
                    Header: _header[key],
                    id: key,
                    accessor: key,
                    foldable: true

                });
            }
        };
        title = columns;
    }
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
        dataList: state.dataList,
        title: title,
        dateTimeBegin: state.datePickers.dateTimeBegin,
        dateTimeEnd: state.datePickers.dateTimeEnd


    };
}


TableData.propTypes = {
    queryEvent: PropTypes.func.isRequired,
}

TableData.contextType = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryEvent })(withRouter(withStyles(styles)(TableData)));
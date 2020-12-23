//******************************************
//

import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';
//import store from './reducers/rootReducer';

import TxtFieldGroup from './stuff/txtField';
import { queryEvent } from './actions/queryActions';
import { addDataList, deleteDataList } from './actions/dataAddActions';
import { updateData } from './actions/adminActions';

import MenuTable from './menuTable';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';


import ReactTable from "react-table";
import ReactTableDefaults from "react-table";

import checkboxHOC from "react-table/lib/hoc/selectTable";
import FoldableTableHOC from '../foldableTable/index';

import "react-table/react-table.css";

import shortid from 'shortid';
import { isNumber } from 'util';
import isEmpty from 'lodash.isempty';

import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

import { withStyles } from '@material-ui/core/styles';
import { isNull } from 'util';

import { reportGen, reportXGen } from './actions/genReportActions';


Object.assign(ReactTableDefaults, {
    previousText: 'Предыдущие',
    nextText: 'Следующие',
    loadingText: 'Loading...',
    noDataText: 'Записей не найдено',
    pageText: 'Страница',
    ofText: 'из',
    rowsText: 'записей',
});

const CheckboxTable = checkboxHOC(ReactTable);


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
            title,
            auth

        } = props;


        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            isLoading: false,
            isForceToggle: false,
            dateTimeBegin,
            dateTimeEnd,
            station_actual,
            stationsList,
            sensorsList: props.sensorsList,
            dataList: [],
            selected: [],
            sensors_actual,

            fixedHeader,
            fixedFooter,
            stripedRows: false,
            showRowHover,
            selectable,
            multiSelectable: true,
            enableSelectAll: true,
            deselectOnClickaway,
            showCheckboxes,
            height: 600,
            defaultPageSize: 50,
            selection: [],
            selectAll: false,
            hideFiltartion: false,
            isEdit: false,
            isData: true
        };


        this.renderEditable = this.renderEditable.bind(this);
    }


    // begin of table functions

    handleUpdateData() {
        if (!isEmpty(this.state.dataList))
            if (this.props.updateData(this.state.dataList)) {
                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно сохранены...' });
                this.setState({ isEdit: false });
                this.setState({ isForceToggle: true });

                this.handleToggleEdit( {target : {name: 'isEdit'}}, false, true); //generation syntetic event
               // this.setState({ isForceToggle: false });

            };
    }

    handleForceToggle()
    {
        this.setState({ isForceToggle: false });
    }

    renderEditable(cellInfo) {

        function _html_out(_obj) {
            if (isEmpty(_obj.state.dataList)) {
                try {
                    var _tmp = Date.parse(_obj.props.dataList[0]["date_time"]);
                    if (!isNaN(_tmp))
                        return { __html: _obj.props.dataList[cellInfo.index][cellInfo.column.id] }
                    else
                        return { __html: _obj.props.dataList[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.props.dataList[cellInfo.index + 1][cellInfo.column.id] }
                }

            } else {
                try {
                    var _tmp = Date.parse(_obj.state.dataList[0]["date_time"]);
                    if (!isNaN(_tmp))
                        return { __html: _obj.state.dataList[cellInfo.index][cellInfo.column.id] }
                    else
                        return { __html: _obj.state.dataList[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.state.dataList[cellInfo.index + 1][cellInfo.column.id] }
                }

            }
        };
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    // if (isEmpty(e.target.innerHTML)) {
                    //    alert("Поле не должно быть пустым");

                    // }
                    // else
                    {

                        var data;
                        if (isEmpty(this.state.dataList)) {
                            data = [...this.props.dataList];

                        } else {
                            data = [...this.state.dataList];
                        }

                        try {
                            var _tmp = Date.parse(data[0]["date_time"]);
                            if (!isNaN(_tmp))
                                data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                            else
                                data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;

                        }
                        catch (err) {
                            data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;
                        }

                        this.setState({ dataList: data });
                        deleteDataList();
                        addDataList(data);
                    }
                }}


                dangerouslySetInnerHTML={
                    _html_out(this)
                }


            />
        );
    } I


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

    handleClose() {
        this.setState({ isLoading: false });
    };

    handleToggleEdit(event, toggled, isForceToggle) {
        var _props;
        var title = [];


        if (toggled) {
            this.setState({ isForceToggle: false });
            this.setState({
                [event.target.name]: toggled
            });
            _props = this.props.title;

            _props.map(item => {
                if (item.Cell === null) item.Cell = this.renderEditable;
                title.push(item);

            });

            this.setState({ title: title });

        }
        else {
            if (isForceToggle) {
                // Done it after SQL update!
                this.setState({
                    [event.target.name]: toggled
                });
                _props = this.state.title;

                _props.map(item => {
                    if (item.Cell === this.renderEditable) item.Cell = null;
                    title.push(item);

                });
                this.setState({ dataList: [] });
                this.setState({ title: title });

            } else {
                if (confirm('Все несохраненные данные будут потеряны! Вы уверены?')) {
                    // Save it!
                    this.setState({
                        [event.target.name]: toggled
                    });
                    _props = this.state.title;

                    _props.map(item => {
                        if (item.Cell === this.renderEditable) item.Cell = null;
                        title.push(item);

                    });
                    this.setState({ dataList: [] });
                    this.setState({ title: title });

                } else { return true; }
            }
        }
        //}
    };

    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });

    };


    handleChange(name, value) {
        if (isNumber(parseInt(value))) { var val = parseInt(value) } else { var val = value };

        this.setState({ [name]: val });


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
    componentDidUpdate() {
        //        var _props;
        //var title = [];
        //_props = this.props.title;

        //        _props.map(item => {
        //           if (item.Cell === null) item.Cell = this.renderEditable;
        //            title.push(item);
        //       });

        // this.setState({ title: this.props.title });

    };
    componentWillMount() {
        // if (isEmpty(this.state.title))
        this.setState({ title: this.props.title });

    };
    render() {
        const { classes, auth } = this.props;
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, height, defaultPageSize, stripedRows } = this.state;

        try {
            var _tmp = Date.parse(this.props.dataList[0]["date_time"]);
            if (!isNaN(_tmp))
                var dataList = this.props.dataList;
            else
                var dataList = this.props.dataList.slice(1);

        }
        catch (err) {
            var dataList = this.props.dataList.slice(1);
        }

        var title = '';
        if (this.state.isEdit) {
            title = this.state.title;
        }
        else {
            title = this.props.title;
        }
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
                //  background color change
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
                <MenuTable {...this.state}
                    handleToggleEdit={this.handleToggleEdit.bind(this)}
                    handleToggle={this.handleToggle.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                    handleClick={this.handleClick.bind(this)}
                    handleClose={this.handleClose.bind(this)}
                    handleUpdateData={this.handleUpdateData.bind(this)}
                    reportXGen={this.props.reportXGen.bind(this)}
                    height={this.state.height}
                    auth ={auth}
                    dataList = {this.props.dataList}
                    stationName = {this.props.station_actual}

                />
                <br />
                <FoldableTable
                    ref={r => (this.FoldableTable = r)}
                    data={dataList}
                    columns={title}
                    {...checkboxProps}
                    defaultPageSize={defaultPageSize}
                    pageSizeOptions={[10, 20, 50, 100, 150, 200, 300]}
                    pageSize={defaultPageSize}
                    previousText={'Предыдущие'}
                    nextText={'Следующие'}
                    loadingText={'Loading...'}
                    noDataText={'Записи не загружены...'}
                    pageText={'Страница'}
                    ofText={'из'}
                    rowsText={'записей'}
                    style={{
                        height: height,
                        backgroundColor: stripedRows ? '#000000' : '',
                        color: stripedRows ? '#FFFFFF' : ''
                    }
                    }
                    className="-striped -highlight"
                    {...this.state}
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
        accessor: "date_time",
        filterable: true
    }, {
        Header: "Тип",
        id: "typemeasure",
        accessor: "typemeasure"
    },
    {
        Header: "Значение",
        id: "measure",
        accessor: "measure",
        filterable: true,
        Cell: null


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
        foldable: true,
        filterable: true,
        Cell: row => (
            <div
                style={{

                    borderRadius: '2px'
                }}
            >
                <div
                    style={{

                        backgroundColor:
                            row.value == 'тревога' ? '#ff2e00' : '',
                        borderRadius: '2px',
                        transition: 'all .2s ease-out',
                        className: '-striped -highlight'
                    }}>
                    {row.value}
                </div>

            </div>)

    }]


    //};

    if (state.sensorsList.length > 1) {

        let _header = state.dataList[0];
        let columns = [];
        for (var key in _header) {
            if ((key !== '_id') && (key != 'date_time')) {
                columns.push({
                    Header: _header[key],
                    id: key,
                    accessor: key,
                    Cell: null
                });
            }
            if (key == 'date_time') {
                columns.push({
                    Header: _header[key],
                    id: key,
                    accessor: key,
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
        sensorsList: state.sensorsList,
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

export default connect(mapStateToProps, { queryEvent, addDataList, deleteDataList, updateData, reportXGen })(withRouter(withStyles(styles)(TableData)));
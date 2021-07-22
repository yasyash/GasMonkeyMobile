import React, { Component } from 'react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';

import MenuReport from './menuReport';

import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from '@material-ui/core/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import Typography from '@material-ui/core/Typography';

import uuid from 'uuid/v1';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';
import isNull from 'lodash.isempty';


import { getStationsList } from './actions/stationsGetAction';
import { queryEvent, queryOperativeEvent, getPointsMeasure, queryMultyReport } from './actions/queryActions';
import { getPoint, getActivePoint } from './actions/adminActions';
import { pointAddAction, pointDeleteAction } from './actions/dataAddActions';
import { deleteActiveStationsList } from './actions/stationsAddAction';
import { reportGen, reportXlsGen } from './actions/genReportActions';


import ReactTable from "react-table";
import { useExpanded } from "react-table";

import checkboxHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from 'react-table/lib/hoc/treeTable';

const CheckboxTable = checkboxHOC(treeTableHOC(ReactTable));
import FoldableTableHOC from '../foldableTable/index';

const FoldableTable = FoldableTableHOC(CheckboxTable);

import { TableRowColumn } from 'material-ui';
import { timeAddAction, timeDeleteAction } from './actions/dateAddAction';

//const pngs = require.context('../../tiles', true, /\.png$/);


//const pinAlert = require.context('./', true, /\.svg$/);
//const keys = pngs.keys();

//const pngsArray = keys.map(key => pngs(key));

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
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


    // .rt-expander:after{content:'';position:absolute;width:0;height:0;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg);border-left:5.04px solid transparent;border-right:5.04px solid transparent;border-top:7px solid rgba(0,0,0,0.8);transition:all .3s cubic-bezier(.175,.885,.32,1.275);cursor:pointer}.ReactTable 
    // .rt-expander.-open:after{transform:translate(-50%,-50%) rotate(0)}.ReactTable
    // .rt-expander{display:inline-block;position:relative;margin:0;color:transparent;margin:0 10px;}.ReactTable


});

const outer = [[50.505, -29.09], [52.505, 29.09]]
const inner = [[49.505, -2.09], [53.505, 2.09]]



function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};



class MultiReportForm extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            stationsList,
            sensorsList,
            auth
        } = props;

        let today = new Date();
        today -= 1200000;//20 min in milliseconds

        this.state = {
            snack_msg: '',
            errors: {},
            bounds: outer,
            stationsList,
            selection: '',
            dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
            _map: {},
            _markers: [],
            openDialog: false,
            lat: 0,
            lon: 0,
            idd: '',
            isLoading: false,
            inMeasure: false,
            iddMeasure: '',
            points_list: [],
            measure_list: [],
            points_old_list: [],
            point_actual: '',
            station_actual: '',
            station_name: 'ПЭЛ',
            place: '',
            descr: '',
            auth: auth,
            fixedHeader: true,
            fixedFooter: true,
            stripedRows: false,
            showRowHover: false,
            selectable: true,
            multiSelectable: false,
            enableSelectAll: false,
            deselectOnClickaway: false,
            showCheckboxes: true,
            height: '500px',
            defaultPageSize: 10,
            isForceToggle: false,
            expanded: {},
            chemical:'Нет',
            title: [
                {
                    Header: "Точка отбора",
                    id: "idd",
                    accessor: row => {
                        return ('Идентификатор: ' + row.idd + ' * * *  Адрес: ' + row.place + '  ' + (isNull(row.descr) ? '' : row.descr) + ' * * *  Периодов измерений: '
                        )
                    },
                    filterable: true,
                    disableExpander: false,
                    width: '100px'

                    //Cell: props => {  return( <b> {props.row._pivotVal}</b>)}

                },
                {
                    Header: "ID точки",
                    id: "_id",
                    accessor: row => {
                        return ('Идентификатор: ' + row.idd)
                    },
                    filterable: true,
                    disableExpander: false,
                    //Cell: props => {  return( <b> {props.row._pivotVal}</b>)}

                },
                {
                    Header: "Адрес",
                    id: "place",
                    accessor: "place",
                    Cell: null,
                    filterable: true,
                    style: {
                        fontWeight: 'bolder',
                    }

                },

                {
                    Header: "Описание",
                    id: "descr",
                    accessor: "descr",
                    Cell: null,
                    filterable: true

                },
                {
                    Header: "Время создания",
                    id: "date_time_begin",
                    accessor: "date_time_begin",
                    Cell: null,
                    filterable: true

                },
                {
                    Header: "Время завершения",
                    id: "date_time_end",
                    accessor: "date_time_end",
                    Cell: null,
                    filterable: true

                },


                {
                    Header: "Широта",
                    id: "lat",
                    accessor: "lat",
                    Cell: null,
                    filterable: true

                },
                {
                    Header: "Долгота",
                    id: "lon",
                    accessor: "lon",
                    Cell: null,
                    filterable: true

                }


            ]
        };

        this.renderEditable = this.renderEditable.bind(this);
        this.handleTableCellClick = this.handleTableCellClick.bind(this);
        this.onExpandedChange = this.onExpandedChange.bind(this);

    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };
    handleClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

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

    };


    toggleSelection(key, shift, row) {
        let selection = [...this.state.selection];

        const keyIndex = selection.indexOf(row._id);
        // check to see if the key exists
        if (keyIndex >= 0) {
            // it does exist so we will remove it using destructing
            selection = [
                ...selection.slice(0, keyIndex),
                ...selection.slice(keyIndex + 1)
            ];

        } else {
            // it does not exist so add it
            selection.push(row._id);
        }
        // update the state
        this.setState({ selection });

    };

    toggleAll() {
        //mULTIFORM
        const selectAll = this.state.selectAll ? false : true;
        const selection = [];
        if (selectAll) {
            // we need to get at the internals of ReactTable
            const wrappedInstance = this.checkboxTable.getWrappedInstance();
            // the 'sortedData' property contains the currently accessible records based on the filter and sort
            const currentRecords = wrappedInstance.props.data;
            // we just push all the IDs onto the selection array
            currentRecords.forEach(item => {

                selection.push(item._id);
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


    handleSnackClose() {
        this.setState({ isLoading: false });

    };


    onClickInner = () => {
        this.setState({ bounds: inner })
    }

    onClickOuter = () => {
        this.setState({ bounds: outer })
    }


    handleChange(name, value) {
        if (isNumber(parseInt(value))) { var val = parseInt(value) } else { var val = value };

        this.setState({ [name]: val });
    };


    onClickReset = () => {
        this.setState({ viewport: DEFAULT_VIEWPORT })
    }

    onViewportChanged = (viewport) => {
        this.setState({ viewport })
    }


    map_load() {
        var inMeasure = false;
        var iddMeasure = '';
        this.props.getPoint().then(data => {
            this.props.getPointsMeasure().then(measure_list => {
                if (data.length > 0) {
                    data.forEach((item, index) => {
                        const { _map } = this.state;



                        let arr_dt = item.date_time_end.split(' ');
                        let arr_d = arr_dt[0].split('-');
                        let arr_t = arr_dt[1].split(':');


                        let date_time_end = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

                        arr_dt = item.date_time_begin.split(' ');
                        arr_d = arr_dt[0].split('-');
                        arr_t = arr_dt[1].split(':');

                        let date_time_begin = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

                        if ((date_time_end < date_time_begin) || (item.in_measure)) {
                            inMeasure = true;
                            iddMeasure = item.idd;
                            item.date_time_end = "";
                            //pointDeleteAction();
                            //pointAddAction({ iddMeasure: iddMeasure, inMeasure: inMeasure, place: item.place, descr: item.descr });

                        } else {

                        }

                    })

                    this.setState({ inMeasure: inMeasure, points_list: data, measure_list: measure_list });

                }
            })
        })

    }



    renderEditable(cellInfo) {

        function _html_out(_obj) {
            if (isEmpty(_obj.state.points_list)) {
                try {
                    //   var _tmp = Date.parse(_obj.props.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.props.points_list[cellInfo.index][cellInfo.column.id] }
                    //   else
                    //       return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }
                }

            } else {
                try {
                    // var _tmp = Date.parse(_obj.state.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.state.points_list[cellInfo.index][cellInfo.column.id] }
                    //else
                    //    return { __html: _obj.state.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.state.dataLipoints_listst[cellInfo.index + 1][cellInfo.column.id] }
                }

            }
        };
        return (
            <div
                style={{ backgroundColor: "#f5f5f5" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    {

                        var data;
                        if (isEmpty(this.state.points_list)) {
                            data = [...this.props.points_list];

                        } else {
                            data = [...this.state.points_list];
                        }

                        try {
                            // var _tmp = Date.parse(data[0]["date_time_begin"]);
                            // if (!isNaN(_tmp))
                            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                            // else
                            //     data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;

                        }
                        catch (err) {
                            data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;
                        }

                        this.setState({ points_list: data });

                    }
                }}


                dangerouslySetInnerHTML={
                    _html_out(this)
                }


            />
        );
    } I


    handleToggleEdit(event, toggled, isForceToggle) {
        const { title, points_list, points_old_list } = this.state;
        var _title = [];


        if (toggled) {
            this.setState({ isForceToggle: false });
            this.setState({
                [event.target.name]: toggled
            });
            //_props = this.props.title;

            title.map(item => {
                if (item.Cell === null) {
                    item.Cell = this.renderEditable;
                }
                _title.push(item);

            });

            this.setState({ title: title });


        }
        else {
            if (isForceToggle) {
                // Done it after SQL update!
                this.setState({
                    [event.target.name]: toggled
                });
                //_props = this.state.title;

                title.map(item => {
                    if (item.Cell === this.renderEditable) item.Cell = null;
                    _title.push(item);

                });
                this.setState({ dataList: [] });
                this.setState({ title: _title });

            } else {
                if (confirm('Все несохраненные данные будут потеряны! Вы уверены?')) {
                    // Save it!
                    this.setState({
                        [event.target.name]: toggled
                    });
                    //_props = this.state.title;

                    title.map(item => {
                        if (item.Cell === this.renderEditable) item.Cell = null;
                        _title.push(item);

                    });
                    this.map_load();
                    this.setState({ dataList: [] });

                    this.setState({ title: _title });

                } else { return true; }
            }
        }
        //}
    };



    componentDidMount() {


        const { stationsList } = this.props;
        let params = {};
        // this.props.queryEvent(params).then(data => {
        //    let lat, lng = 0;
        //   let params = {};
        //   params.period_from = this.state.dateTimeBegin;
        //   params.period_to = this.state.dateTimeEnd;

        //  getStationsList(data);
        this.map_load();
        // })


    }



    onClick(event) {
        if (event == 'true')
            window.open("https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon");
    }


    handleSnackClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };


    handleTableCellClick(
        state,
        rowInfo,
        column,
        instance,
        ...rest
    ) {
        if (typeof rowInfo !== "undefined") {
            const needsExpander =
                rowInfo.subRows && rowInfo.subRows.length > 1 ? true : false;
            const expanderEnabled = !column.disableExpander;
            const expandedRows = Object.keys(this.state.expanded)
                .filter(expandedIndex => {
                    return this.state.expanded[expandedIndex] !== false;
                })
                .map(Number);

            const rowIsExpanded =
                expandedRows.includes(rowInfo.nestingPath[0]) && needsExpander
                    ? true
                    : false;
            const newExpanded = !needsExpander
                ? this.state.expanded
                : rowIsExpanded && expanderEnabled
                    ? {
                        ...this.state.expanded,
                        [rowInfo.nestingPath[0]]: false
                    }
                    : {
                        ...this.state.expanded,
                        [rowInfo.nestingPath[0]]: {}
                    };

            return {
                style:
                    needsExpander && expanderEnabled
                        ? { cursor: "pointer" }
                        : { cursor: "auto" },
                onClick: (e, handleOriginal) => {
                    this.setState({
                        expanded: newExpanded
                    });
                }
            };
        } else {
            return {
                onClick: (e, handleOriginal) => {
                    if (handleOriginal) {
                        handleOriginal();
                    }
                }
            };
        }
    };

    onExpandedChange(newExpanded) {
        this.setState({
            expanded: newExpanded
        });
    }

    handleReportChange = (state) => {
        const { selection, measure_list } = this.state;

        let params = {};
        let _measure_list = [];

        selection.forEach((item, ind) => {
            let _tmplist = measure_list.filter((element, i) => {
                return item == element._id;
            })
            if (_tmplist.length > 0)
                _measure_list.push(..._tmplist);
        });

        //e.preventDefault();
        //  this.setState({ dateTimeBegin: this.props.dateTimeBegin, dateTimeEnd: this.props.dateTimeEnd });
        //this.loadData().then(data => this.setState({ sensorsList: data }));



        //params.period_from = this.state.dateTimeBegin;
        //params.period_to = this.state.dateTimeEnd;
        //params.station = state.station_actual;
        params.points = _measure_list;
        params.station_name = this.state.station_name;

        this.props.queryMultyReport(params).then(data => {
            if (data) {
                let data_4_report = data.data.data_4_report;

                //this.setState(data_4_report);


                //multiform data


                this.setState({ 'data_4_report': data_4_report });


                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            };


        });


    };

    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, stationsList, auth, height, defaultPageSize, stripedRows, title, data_4_report } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        const { sensorsList } = this.props;
        const { tab_no } = this.state;

        const { points_list, measure_list } = this.state;
        const { snack_msg, isLoading } = this.state;
        const _header = [{
            Header: "Перечень точек отбора",
            columns: title
        }];

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
            toggleAll: toggleAll.bind(this),
            selectType: "checkbox",
            getTrProps: (s, r) => {
                let selected = false;
                // someone asked for an example of a background color change
                // here it is...
                if (r) {
                    if (r.original)
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


            <Paper>
                <br />
                <MenuReport
                    {...this.props} snack_msg={snack_msg} isLoading={isLoading} autoHideDuration={3000}
                    station_name={this.state.station_name}
                    //station_actual={this.state.station_actual}
                    //dateReportBegin={this.state.dateReportBegin}
                    report_type='multi'
                    data_4_report={this.state.data_4_report}

                    handleReportChange={this.handleReportChange.bind(this)}
                    handleSnackClose={this.handleSnackClose.bind(this)}

                />

                <Typography component="div" style={{ padding: 2 * 1 }} id="multi_report">


                    <br />

                    <div >
                        <CheckboxTable
                            //getTrProps={this.handleTableCellClick}
                            onExpandedChange={newExpanded => this.onExpandedChange(newExpanded)}
                            expanded={this.state.expanded}
                            pivotBy={["idd"]}

                            ref={r => (this.checkboxTable = r)}
                            {...checkboxProps}
                            freezWhenExpanded={true}
                            data={measure_list}
                            columns={title}
                            PageSize={defaultPageSize}
                            previousText={'Предыдущие'}
                            nextText={'Следующие'}
                            loadingText={'Loading...'}
                            noDataText={'Записей не найдено'}
                            pageText={'Страница'}
                            ofText={'из'}
                            rowsText={'записей'}
                            style={{
                                height: height,  // This will force the table body to overflow and scroll, since there is not enough room
                                backgroundColor: stripedRows ? '#000000' : '',
                                color: stripedRows ? '#FFFFFF' : ''
                            }}
                            className="-striped -highlight"
                            {...this.state}

                        />
                        <br />
                        <Tips />
                    </div>
                    <hr style={{ width: "80%", size: "1" }} />
                    <div> {(data_4_report) && (data_4_report.map((option, i) => (<div key={'div_' + i.toString()} >
                        <b>1. Объект(наименование, координаты, адрес): </b>{option.place}&nbsp;&nbsp;Широта:{option.lat} Долгота: {option.lon}<br />
                        <b>2. Дата измерений: время начала измерения: </b>{option.date}<br />
                        <b>3. Результаты измерений:</b><br />
                        <br />
                        <table border="1" width="100%" style={{ 'textAlign': 'center' }} className={classes._td} id="multidata_report_table">
                            <tbody>
                                <tr key={'trmulti_header'} >
                                    <td style={{ 'width': '3%' }} rowSpan="2">
                                        <b> Время завершения периода</b>
                                    </td>
                                    <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                        Темп.,
                                        С
                            </td>
                                    <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                        Напр. ветра, град.
                            </td>
                                    <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                        Скор. ветра, м/с                            </td>
                                    <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                        Атм. давление, мм. рт. ст.
                                </td>
                                    <td style={{ 'width': '3%', 'fontSize': '11px' }} rowSpan="2">
                                        Отн. влажность, %
                                </td>
                                    <td style={{ 'width': '85%' }} colSpan="24">
                                        <b> Концентрация, мг/м. куб.</b>
                                    </td>
                                </tr>

                                <tr key={'trmulti_header2'} style={{ 'fontSize': '11px' }}>


                                    <td style={{ 'width': '5%' }} >
                                        NO
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        NO2
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        NH3
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        NOx
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        SO2
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        H2S
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        O3
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        CO
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        CH
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        CH4
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        HCH
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        CH2O
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        PM1
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        PM2.5
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        PM10
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        Пыль общая
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        бензол
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        толуол
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        этилбензол
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        м,п-ксилол

                                    </td>
                                    <td style={{ 'width': '5%' }} >
                                        о-ксилол
                                  </td>
                                    <td style={{ 'width': '5%' }} >
                                        хлорбензол
                                </td>
                                    <td style={{ 'width': '5%' }} >
                                        стирол
                                 </td>
                                    <td style={{ 'width': '5%' }} >
                                        фенол
                                      </td>
                                </tr>

                                {(option.pollution) &&// if not empty
                                    option.pollution.map((element, j) => (
                                        <tr key={'trmulti_' + j.toString() + '_' + i.toString()} style={{ 'fontSize': '11px' }}>
                                            <td> {element.time}</td>
                                            <td> {element.Tout}</td>
                                            <td> {element.WindD}</td>
                                            <td> {element.WindV}</td>
                                            <td> {element.P}</td>
                                            <td> {element.Hout}</td>
                                            <td className=
                                                {classes[element.NO_err]}> {element.NO}</td>
                                            <td className=
                                                {classes[element.NO2_err]}> {element.NO2}</td>
                                            <td className=
                                                {classes[element.NH3_err]}> {element.NH3}</td>
                                            <td className=
                                                {classes[element.NOx_err]}> {element.NOx}</td>
                                            <td className=
                                                {classes[element.SO2_err]}> {element.SO2}</td>
                                            <td className=
                                                {classes[element.H2S_err]}> {element.H2S}</td>
                                            <td className=
                                                {classes[element.O3_err]}> {element.O3}</td>
                                            <td className=
                                                {classes[element.CO_err]}> {element.CO}</td>
                                            <td className=
                                                {classes[element.CH_err]}> {element.CH}</td>
                                            <td className=
                                                {classes[element.CH4_err]}> {element.CH4}</td>
                                            <td className=
                                                {classes[element.HCH_err]}> {element.HCH}</td>
                                            <td className=
                                                {classes[element.CH2O_err]}> {element.CH2O}</td>
                                            <td className=
                                                {classes[element.PM1_err]}> {element.PM1}</td>
                                            <td className=
                                                {classes[element['PM25_err']]}> {element['PM25']}</td>
                                            <td className=
                                                {classes[element['PM10_err']]}> {element.PM10}</td>
                                            <td className=
                                                {classes[element['TSP_err']]}> {element['TSP']}</td>
                                            <td className=
                                                {classes[element['C6H6_err']]}>  {element['C6H6']}</td>
                                            <td className=
                                                {classes[element['C7H8_err']]}> {element['C7H8']}</td>
                                            <td className=
                                                {classes[element['C8H10_err']]}> {element['C8H10']}</td>
                                            <td className=
                                                {classes[element['C8H10MP']]}> {element['C8H10MP']}</td>
                                            <td className=
                                                {classes[element['C8H10MPO_err']]}> {element['C8H10O']}</td>
                                            <td className=
                                                {classes[element['C6H5Cl_err']]}> {element['C6H5Cl']}</td>
                                            <td className=
                                                {classes[element['C8H8_err']]}> {element['C8H8']}</td>
                                            <td className=
                                                {classes[element['C6H5OH_err']]}> {element['C6H5OH']}</td>



                                        </tr>
                                    ))}
                            </tbody>
                        </table> <br /></div>))
                    )} </div>
                </Typography>

            </Paper >
        );
    }
}

function mapStateToProps(state) {

    return {
        //stationsList: state.stationsList,
        active_point: state.points[0].active_point
    };
}


MultiReportForm.propTypes = {
    classes: PropTypes.object.isRequired,

    //loadData: PropTypes.func.isRequired
}

MultiReportForm.contextType = {
    // router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, {
    reportGen, reportXlsGen,
    queryMultyReport,
    queryEvent, queryOperativeEvent, getPointsMeasure, getPoint, timeAddAction, timeDeleteAction,
    getActivePoint, pointAddAction, pointDeleteAction, deleteActiveStationsList
})(withRouter(withStyles(styles)(MultiReportForm)));

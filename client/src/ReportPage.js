

import React from 'react';
import UserEventForm from './userEventForm';
import { connect } from 'react-redux';

import ReportForm from './ReportForm';


class ReportPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            errors: {},
            isLoading: false,
            stationsList: [],
            sensorsList: [],
            selectedSensors: [],
            dataList: [],
            meteoList: [],
            station_actual: '',
            sensors_actual: [],
            chartDate: {},
            macs: [], //max allowable consentration
            checkedMeteo: true,
            meteoOptions: [

                {
                    header: "Внешняя температура",
                    id: "temp_out",
                    visible: true

                },
                {
                    header: "Макс. значение темп.",
                    id: "temp_hi",
                    visible: false
                },
                {
                    header: "Мин. значение темп.",
                    id: "temp_low",
                    visible: false

                },
                {
                    header: "Влажность внешняя",
                    id: "hum_out",
                    visible: true


                },
                {
                    header: "Точка росы",
                    id: "dew_pt",
                    visible: false


                }, {
                    header: "Давление",
                    id: "bar",
                    visible: false

                },
                {
                    header: "Осадки, мм",
                    id: "rain",
                    visible: true

                },
                {
                    header: "Внутр. темп.,С",
                    id: "temp_in",
                    visible: true

                },
                {
                    header: "Влажн. внутр.",
                    id: "hum_in",
                    visible: true

                },
                {
                    header: "Скор. ветра (м/с)",
                    id: "speed_wind",
                    visible: true

                },
                {
                    header: "Направление",
                    id: "dir_wind",
                    visible: false

                },
                {
                    header: "Пробег ветра,км.",
                    id: "run_wind",
                    visible: false

                },
                {
                    header: "Макс. скор.",
                    id: "speed_wind_hi",
                    visible: false

                },
                {
                    header: "Преимущ. напр.",
                    id: "dir_wind_hi",
                    visible: false

                },
                {
                    header: "Температура на ветру",
                    id: "chizzzll_wind",
                    visible: false

                },
                {
                    header: "Тепловой индекс,C",
                    id: "heat_indx",
                    visible: false

                },
                {
                    header: "Темп.-влажн. индекс",
                    id: "thw_indx",
                    visible: false

                },
                {
                    header: "Темп.-солн.-влажн. индекс",
                    id: "thsw_indx",
                    visible: false

                },

                {
                    header: "Интенсивн. осадков",
                    id: "rain_rate",
                    visible: false

                },
                {
                    header: "Солн. радиация",
                    id: "rad_solar",
                    visible: false

                },
                {
                    header: "Солн. энерг.",
                    id: "enrg_solar",
                    visible: false

                },
                {
                    header: "Солн. рад. макс.",
                    id: "rad_solar_hi",
                    visible: false

                },
                {
                    header: "УФ-индекс",
                    id: "uv_indx",
                    visible: false

                },
                {
                    header: "Доза УФ",
                    id: "uv_dose",
                    visible: false

                },
                {
                    header: "УФ индекс макс.",
                    id: "uv_hi",
                    visible: false

                },
                {
                    header: "Внутр. точка росы",
                    id: "dew_in",
                    visible: false

                },
                {
                    header: "Внутр. тепл. индекс",
                    id: "emc_in",
                    visible: false

                },
                {
                    header: "Влагосодержание внутр.",
                    id: "et",
                    visible: false

                },
                {
                    header: "Плотн. возд. внутр.",
                    id: "density_air_in",
                    visible: false

                }
            ] 
        
        }
    }

    render() {
        return (
            <div className="container">

                <ReportForm  {...this.state} />

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fixedHeader: state.fixedHeader,
        fixedFooter: state.fixedFooter,
        stripedRows: state.stripedRows,
        showRowHover: state.showRowHover,
        selectable: state.selectable,
        multiSelectable: state.multiSelectable,
        enableSelectAll: state.enableSelectAll,
        deselectOnClickaway: state.deselectOnClickaway,
        showCheckboxes: state.showCheckboxes,
        height: state.height
    };
}


export default (ReportPage);
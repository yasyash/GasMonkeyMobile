import React from 'react';
import { Switch, Route } from 'react-router-dom'
//import { IndexRoute} from 'react-router-dom';
import requireAuth from './stuff/requireAuth';

import loginPage from './loginPage';
import App from './App';
import signUp from './signUp';
import UserEventPage from './usereventPage'
import TablePage from './TablePage';
import MeteoPage from './MeteoPage';
import ChartPage from './ChartPage';
import ReportPage from './ReportPage';
import  AdminPage from './AdminPage';

import Divider from 'material-ui/Divider';

export default (
    <div><Divider/>
        <div className="routes form-control">
            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/signup" component={signUp} />
                <Route path="/login" component={loginPage} />
                <Route path="/myuserevent" component={requireAuth(UserEventPage)} />
                <Route path="/tables" component={requireAuth(TablePage)} />
                <Route path="/meteo" component={requireAuth(MeteoPage)} />
                <Route path="/charts" component={requireAuth(ChartPage)} />
                <Route path="/reports" component={requireAuth(ReportPage)} />
                <Route path="/admin" component={requireAuth(AdminPage)} />

            </Switch>
        </div>
    </div>


)


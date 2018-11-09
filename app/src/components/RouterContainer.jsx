import React from 'react';
import { IndexRoute, Router, Route, hashHistory, Link, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import App from './App.jsx';
import Content from './Content.jsx';
import Login from './Login.jsx';
import CreateUser from './CreateUser.jsx';
import CreateComplaint from './CreateComplaint.jsx';
import ManageComplaint from './ManageComplaint.jsx';
import CreateCommunity from './CreateCommunity.jsx';
import CommunityList from './CommunityList.jsx';
import ManageCommunity from './ManageCommunity.jsx';



export const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

export default class RouterContainer extends React.Component{
  render(){
    return (
      <Router history={appHistory}>
        <Route path="/manage" component={App}>
          <IndexRoute component={Content} />
          <Route path="/complaint/manage/:id" component={ManageComplaint} />
          <Route path="/community/create" component={CreateCommunity} />
          <Route path="/user/create" component={CreateUser} />
          <Route path="/community" component={CommunityList} />
          <Route path="/community/manage/:id" component={ManageCommunity} />*/}
        </Route>
        <Route path="/" component={CreateComplaint} />
        <Route path="/auth/login" component={Login}/>
      </Router>
    );
  }
}

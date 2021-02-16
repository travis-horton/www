import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import {
  Home, Piano, Programming, Accounting, Blog,
} from './Pages/index';

import Header from './Components/Header';
import Footer from './Components/Footer';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
      <Switch>
        <Route path="/programming">
          <Programming />
        </Route>
      </Switch>
      <Switch>
        <Route path="/piano">
          <Piano />
        </Route>
      </Switch>
      <Switch>
        <Route path="/accounting">
          <Accounting />
        </Route>
      </Switch>
      <Switch>
        <Route path="/blog">
          <Blog />
        </Route>
      </Switch>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

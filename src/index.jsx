import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';

import {
  Home, Piano, Programming, Accounting, Blog,
} from './Pages/index';
import Header from './Components/Header';
import Footer from './Components/Footer';

import './App.module.css';

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <meta charset="utf-8" />
      <link rel="icon" href="media/favicons/travFavicon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>thor</title>
    </Helmet>
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </Switch>
      <Switch>
        <Route path="/home">
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

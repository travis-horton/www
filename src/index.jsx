import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import styles from './App.module.css';
import {
  Home, Piano, Programming, Accounting, Blog,
} from './Pages/index';

import Header from './Components/Header';
import Footer from './Components/Footer';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Header />
      <div className={styles.main}>
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
      </div>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

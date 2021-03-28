import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import favicon from 'media/favicons/travFavicon.png';

import {
  Home, Piano, Programming, Blog, Contact,
} from './Pages';
import Header from './Components/Header';
import Footer from './Components/Footer';

import './App.module.css';

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <meta charSet="utf-8" />
      <link rel="icon" href={favicon} type="image/png" sizes="16x16" />
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
        <Route path="/blog">
          <Blog />
        </Route>
      </Switch>
      <Switch>
        <Route path="/contact">
          <Contact />
        </Route>
      </Switch>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter, Route, Switch, Redirect
} from 'react-router-dom';
import { Helmet } from 'react-helmet';

import favicon from 'url:./assets/media/favicons/favicon.png';

import {
  Home, Piano, Programming, Blog, Contact,
} from './pages';
import { Header, Footer } from '/src/sharedComponents';

const App = () =>
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
      <Footer />
    </BrowserRouter>
  </React.StrictMode>;

export default App;

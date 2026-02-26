import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import favicon from './assets/media/favicons/favicon.png';

import {
  Home, Piano, Programming, Blog, Contact, Journal, NotFound,
} from './pages';
import { Header, Footer } from './sharedComponents';

function App() {
  return (
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
          <Route path="/" exact><Home /></Route>
          <Route path="/programming"><Programming /></Route>
          <Route path="/piano"><Piano /></Route>
          <Route path="/blog"><Blog /></Route>
          <Route path="/contact"><Contact /></Route>
          <Route path="/journal"><Journal /></Route>
          <Route><NotFound /></Route>
        </Switch>
        <Footer />
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

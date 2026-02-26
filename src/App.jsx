import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import {
  Home, Piano, Programming, Blog, Contact, Journal, NotFound,
} from './pages';
import { Header, Footer } from './sharedComponents';

function App() {
  return (
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
  );
}

export default App;

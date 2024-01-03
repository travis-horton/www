import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import favicon from './assets/media/favicons/favicon.png';

import {
  Home, Piano, Programming, Blog, Contact,
} from './pages';
import { Header, Footer } from './sharedComponents';

const subdirectory = () => {
  return document.location.pathname.split('/')[1];
};

const App = () => {
  const [selectedTab, setSelectedTab] = useState(subdirectory());

  return (
    <React.StrictMode>
      <Helmet>
        <meta charSet="utf-8" />
        <link rel="icon" href={favicon} type="image/png" sizes="16x16" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>thor</title>
      </Helmet>
      <BrowserRouter>
        <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        <Switch>
          <Route path="/" exact>
            <Home setSelectedTab={setSelectedTab} />
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
    </React.StrictMode>
  );
}

export default App;

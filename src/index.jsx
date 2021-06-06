import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import favicon from 'url:./media/favicons/travFavicon.png';

import {
  Home, Piano, Programming, Blog, Contact,
} from './assets/pages';
import { Header, Footer } from './sharedComponents';

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <meta charSet="utf-8" />
      <link rel="icon" href={favicon} type="image/png" sizes="16x16" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>thor</title>
    </Helmet>
    <Header />
    <Footer />
  </React.StrictMode>,
  document.getElementById('root'),
);

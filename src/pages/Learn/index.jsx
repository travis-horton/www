import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LearnHome from './LearnHome';
import SeximalHome from './SeximalHome';
import Drill from './Drill';
import TokiPonaHome from './TokiPonaHome';
import TokiPonaDrill from './TokiPonaDrill';
import TokiPonaReview from './TokiPonaReview';
import { NotFoundContent } from '../NotFound';
import { Titled } from '/src/sharedComponents/DocumentHead';

import './styles.css';

// Each page's tab title (sharedComponents/DocumentHead says why it is set
// here, on the leaf, and not once for the whole section).
const titled = (title, page) => <Titled title={title}>{page}</Titled>;

function Learn() {
  return (
    <main>
      <Routes>
        <Route path="seximal/:levelId" element={titled('Seximal', <Drill />)} />
        <Route path="seximal" element={titled('Seximal', <SeximalHome />)} />
        <Route
          path="toki-pona/review"
          element={titled('toki pona review', <TokiPonaReview />)}
        />
        <Route
          path="toki-pona/:levelId"
          element={titled('toki pona', <TokiPonaDrill />)}
        />
        <Route
          path="toki-pona"
          element={titled('toki pona', <TokiPonaHome />)}
        />
        <Route index element={titled('Learn', <LearnHome />)} />
        <Route path="*" element={titled('Not found', <NotFoundContent />)} />
      </Routes>
    </main>
  );
}

export default Learn;

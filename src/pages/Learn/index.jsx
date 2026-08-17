import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LearnHome from './LearnHome';
import SeximalHome from './SeximalHome';
import Drill from './Drill';
import TokiPonaHome from './TokiPonaHome';
import TokiPonaDrill from './TokiPonaDrill';
import TokiPonaReview from './TokiPonaReview';

import './styles.css';

function Learn() {
  return (
    <main>
      <Routes>
        <Route path="seximal/:levelId" element={<Drill />} />
        <Route path="seximal" element={<SeximalHome />} />
        <Route path="toki-pona/review" element={<TokiPonaReview />} />
        <Route path="toki-pona/:levelId" element={<TokiPonaDrill />} />
        <Route path="toki-pona" element={<TokiPonaHome />} />
        <Route index element={<LearnHome />} />
      </Routes>
    </main>
  );
}

export default Learn;

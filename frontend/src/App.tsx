import React, { FunctionComponent, useEffect } from 'react';
import { HomePage } from "@modules";
import { MainMenuGlobalComponent } from "@/global-components";
import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';
import DocumentTitle from 'react-document-title'

const App: React.FC = () => (
  <>
    <Router>
      <MainMenuGlobalComponent />
      <Routes>
        <Route path='/' element={<HomePage msg="HomePage" />} />
      </Routes>
    </Router>

  </>
);

export default App;

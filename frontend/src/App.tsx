import React, { FunctionComponent, useEffect } from 'react';
import { HomePage, AggrementsPage } from "@modules";
import { MainMenuGlobalComponent } from "@/global-components";
import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';
import DocumentTitle from 'react-document-title'
import { Login } from "./components/login";
import { Logout } from './components/logout';

const App: React.FC = () => (
  <>
    <Router>
      <MainMenuGlobalComponent />
      <Routes>
        <Route path='/' element={<HomePage msg="HomePage" />} />
        <Route path='/AggrementsPage' element={<AggrementsPage msg="AggrementsPage" />} />
        <Route path='/login' element={<Login msg="LoginPage" />} />
        <Route path='/logout' element={<Logout />} />
      </Routes>
    </Router>

  </>
);

export default App;

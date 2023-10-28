import React, { FunctionComponent, useEffect, useState } from 'react';
import { HomePage, AggrementsPage, Login, Logout } from "@/components/pages";
import { MainMenuGlobalComponent } from "@/components/global/MainMenuGlobalComponent";
import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';
import useDocumentTitleComponent from '@/components/global/useDocumentTitleComponent'
import Layout from "@/components/layout/auth_layout"

import { ModalProvider } from './components/providers/modal-provider';
import { ToasterProvider } from './components/providers/toast-provider';
import { ThemeProvider } from './components/theme-provider';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex flex-col  w-full h-full">
          <ToasterProvider />
          <ModalProvider />
          <Router>
            <Routes>
              <Route path='/' element={<AggrementsPage msg="AggrementsPage" />} />
              <Route path='/login' element={<Login msg="LoginPage" />} />
              <Route path='/logout' element={<Logout />} />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App

import React, { FunctionComponent, useEffect, useState } from 'react';
import { HomePage, DashboardPage, Login, Logout } from "@/components/pages";
import { MainMenuGlobalComponent } from "@/components/global/MainMenuGlobalComponent";
import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';
import useDocumentTitleComponent from '@/components/global/useDocumentTitleComponent'
import Layout from "@/components/layout/auth_layout"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ModalProvider } from './components/providers/modal-provider';
import { ToasterProvider } from './components/providers/toast-provider';
import { ThemeProvider } from './components/theme-provider';

function App() {
  const [count, setCount] = useState(0)
  // Create a client
  const queryClient = new QueryClient()

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col  w-full h-full">
            <ToasterProvider />
            <ModalProvider />
            <Router>
              <Routes>
                <Route path='/' element={<DashboardPage msg="DashboardPage" />} />
                <Route path='/login' element={<Login msg="LoginPage" />} />
                <Route path='/logout' element={<Logout />} />
              </Routes>
            </Router>
          </div>
        </QueryClientProvider>

      </ThemeProvider>
    </>
  )
}

export default App

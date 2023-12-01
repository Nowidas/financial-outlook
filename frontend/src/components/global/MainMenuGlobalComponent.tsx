import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainNav } from "@/components/global/main-nav";
import { UserDropdownMenu } from "@/components/ui/user-dropdown"
import { SunMoon } from 'lucide-react';
import { useTheme } from "../theme-provider";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme()
  const location = useLocation();
  // const [isAuth, setIsAuth] = useState(false);
  // useEffect(() => {
  //   if (localStorage.getItem('access_token') !== null) {
  //     setIsAuth(true);
  //   }
  // }, [isAuth]);
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav location={location} />
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => {
            if (localStorage.getItem('vite-ui-theme') == 'dark') {
              setTheme('light');
            } else {
              setTheme("dark");
            }
          }}>
            <SunMoon /> </Button>
          <UserDropdownMenu />
        </div>
      </div>
    </div>
  );
};

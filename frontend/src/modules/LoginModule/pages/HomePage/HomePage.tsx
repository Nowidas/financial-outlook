import React, { useEffect, useState } from "react";
import "./HomePage.scss";
import { useDocumentTitleComponent } from "@/global-components";


interface IProps {
  msg: string;
}

export const HomePage: React.FC<IProps> = ({ msg }) => {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDate, setCurrentDate] = useState(0);
  useDocumentTitleComponent({ title: 'Spotify - HomePage' })
  useEffect(() => {
    fetch(' http://127.0.0.1:8000/').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
      setCurrentDate(data.date)
    });
  }, []);

  return (
    <>
      <h1>{msg}</h1>
      <div className="card">
        <button
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </button>
        <h3>The date is {currentDate} and the time is {currentTime}.</h3> <br />
      </div>
    </>
  );
};

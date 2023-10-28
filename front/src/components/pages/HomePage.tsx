import React, { useEffect, useState } from "react";
import { useDocumentTitleComponent } from "@/components/global";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";


interface IProps {
  msg: string;
}

export const HomePage: React.FC<IProps> = ({ msg }) => {
  const [count, setCount] = useState(0);
  useDocumentTitleComponent({ title: 'Financial Dashboard' })


  return (
    <>
      <div className="p-4">
        <h1> Hi world </h1>
        <Button
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </Button>

        <h3>The date is.</h3> <br />
      </div>
    </>
  );
};

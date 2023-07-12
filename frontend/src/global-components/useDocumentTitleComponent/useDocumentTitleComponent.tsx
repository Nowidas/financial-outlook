import React, { useRef, useEffect } from "react";
import "./useDocumentTitleComponent.scss";
import ViteSvg from "@/assets/images/vite.svg";

export const useDocumentTitleComponent: React.FC<{ title: string, prevailOnUnmount?: boolean }> = ({ title, prevailOnUnmount = false }) => {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => () => {
    if (!prevailOnUnmount) {
      document.title = defaultTitle.current;
    }
  }, [])
  return (
    <></>
  )
};
export default useDocumentTitleComponent

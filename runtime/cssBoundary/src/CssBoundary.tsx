import React, { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { createShadowInstance, deleteShadowInstance } from "./styleLoader";

export const CssBoundary = ({ children }: { children: ReactNode }) => {
  const id = useRef(`${Date.now() + Math.random()}`);
  const [appPlaceholder, setAppPlaceholder] = useState<ShadowRoot>();

  useEffect(() => {
    const placeholder = createShadowInstance(id.current);
    setAppPlaceholder(placeholder);
    return () => {
      deleteShadowInstance(id.current);
    };
  }, []);

  return <div id={id.current}>{appPlaceholder && ReactDOM.createPortal(children, appPlaceholder)}</div>;
};

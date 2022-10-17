import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createShadowInstance, deleteShadowInstance } from '../styleLoader';

const CssBoundary = ({ children }) => {
  const id = useRef(Date.now() + Math.random());
  const [appPlaceholder, setAppPlaceholder] = useState(null);

  useEffect(() => {
    const placeholder = createShadowInstance(id.current);
    setAppPlaceholder(placeholder);
    return () => {
      deleteShadowInstance(id.current);
    };
  }, []);

  return (
    <div id={id.current}>{appPlaceholder && ReactDOM.createPortal(children, appPlaceholder)}</div>
  );
};

export default CssBoundary;

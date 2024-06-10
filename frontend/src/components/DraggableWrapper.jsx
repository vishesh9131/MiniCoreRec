import React, { useRef } from "react";
import Draggable from "react-draggable";

const DraggableWrapper = ({ children, func, ...props }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} onStop={func} {...props}>
      <div ref={nodeRef}>{children}</div>
    </Draggable>
  );
};

export default DraggableWrapper;

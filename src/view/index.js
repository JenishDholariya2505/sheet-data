import React from "react";
import { Wrapper } from "./style";

const ViewData = ({ response }) => {
  var parser = new DOMParser();
  var doc = parser.parseFromString(response, "text/html");
  var element =
    doc.getElementById("modal-place").children?.[0].children?.[1]?.children?.[1]
      ?.children?.[0]?.children?.[1]?.children?.[1];

  //   var shadowHost =
  //     doc.getElementById("h10-bsr-graph")?.children?.[0]?.shadowRoot
  //       ?.children?.[1]?.children?.[0]?.shadowRoot?.children?.[1]?.children?.[0]
  //       ?.children?.[2]?.children?.[1]?.children?.[0]?.children?.[0]
  //       ?.children?.[1]?.children?.[1];

  return (
    <Wrapper>
      Jenish
      <div dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
    </Wrapper>
  );
};

export default ViewData;

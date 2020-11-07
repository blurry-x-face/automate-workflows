import React from "react";
import { Card } from "antd";

const { Meta } = Card;
export default function AppCard(props) {
  return (
    <div className="app-card">
      <img src={props.src} />
      <p>{props.desc}</p>
    </div>
    // <Card
    //   hoverable
    //   style={{ width: 240 }}
    //   cover={
    //     <img
    //       alt="example"
    //       src={props.src}
    //     />
    //   }
    // >
    //   <Meta title="Gmail" description="" />
    // </Card>
  );
}

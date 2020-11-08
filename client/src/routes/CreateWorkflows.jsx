import React from "react";
import { useEffect, useState } from "react";
import { Button, Input, Divider } from "antd";
import axios from "axios";
import { Typography } from "antd";
import AppCard from "../components/AppCard";
import gmail from "../assets/gmail.png";
import slack from "../assets/slack.png";
import calender from "../assets/calender.png";
import drive from "../assets/drive.png";
import doc from "../assets/doc.png";

const { Title } = Typography;

export default function CreateWorkflows(props) {
  const [aup, setAup] = useState("");
  const createAUP = () => {
    axios({
      method: "post",
      url: "http://localhost:4000/api/aup/create",
      data: { aup },
      withCredentials: true,
    })
      .then((res) => {
        if (res.status == 200) {
          props.history.push(`/aup/${res.data.id}`);
        }
      })
      .catch((e) => console.log(e.message));
  };
  return (
    <div className="aup-card">
      <div className="aup-card-inner">
        <Title level={3}>Create your own automated workflow</Title>
        {/* <div className="aup-form"> */}
        <Input
          type="text"
          value={aup}
          onChange={(e) => setAup(e.target.value)}
          placeholder="Workflow Name"
          style={{ margin: "10px 0px" }}
        />
        <Button
          type="primary"
          shape="round"
          onClick={createAUP}
          style={{ alignSelf: "flex-end" }}
        >
          Create Workflow
        </Button>
      </div>
      <Title level={4} style={{ marginTop: "8vh" }}>
        Available Integrations
      </Title>
      <div className="app-card-container">
        <AppCard src={gmail} desc="Gmail" />
        <AppCard src={slack} desc="Slack" />
        <AppCard src={calender} desc="Calender" />
        <AppCard src={drive} desc="Drive" />
        <AppCard src={doc} desc="Doc" />
      </div>
    </div>
  );
}

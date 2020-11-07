import React from "react";
import axios from "axios";
import { Button } from "antd";
import { useCookies } from "react-cookie";

export default function Aup({ match }) {
  const [aupData, setAupData] = React.useState({});
  const [cookies, setCookie] = useCookies(["currentaup"]);
  // console.log(match);
  React.useEffect(() => {
    axios
      .get(`http://localhost:4000/api/aup/currentaup/${match.params.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status == 200) setCookie(res.data.id);
        console.log(res);
      });
    axios
      .get(`http://localhost:4000/api/aup/get/${match.params.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status == 200) setAupData(res.data);
        console.log(res.data);
      });
  }, []);

  const authSlack = () => {
    var myWindow = window.open(
      "http://localhost:4000/api/slack",
      "myWindow",
      "width=400, height=600"
    );
    const checkWindow = () => {
      if (!myWindow.closed) return;
      clearInterval(inter);
      console.log("Gmail Authenticated");
    };
    var inter = setInterval(checkWindow, 1000);
  };
  const selectChannel = () => {
    axios
      .get("http://localhost:4000/api/slack/getChannelList")
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const sendMessage = () => {
    axios
      .get("http://localhost:4000/api/slack/getChannelList", {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      <h1>Hello</h1>
      <p>{match.params.id} wale route pe ho bc</p>
      <Button type="primary" shape="round" onClick={authSlack}>
        Auth Slack
      </Button>
      <Button type="primary" shape="round" onClick={selectChannel}>
        Select Channel
      </Button>
      <Button type="primary" shape="round" onClick={sendMessage}>
        Get Channel List
      </Button>
    </div>
  );
}

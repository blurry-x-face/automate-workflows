import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Divider, Menu, Dropdown, Button, Typography, Card } from "antd";
import WorkflowCard from "../components/WorkflowCard";
import { PlusCircleOutlined } from "@ant-design/icons";

const gmailType = ["NEW_MESSAGES", "STAR", "FROM_ONLY"];
const { Title, Text } = Typography;

export default function Aup({ match }) {
  const [aupData, setAupData] = React.useState({});
  // const [gmailAccount, setGmailA] = React.useState({});
  const [channels, setChannels] = React.useState([]);
  const [channelsLoaded, setchannelsLoaded] = React.useState(false);
  const [channelsLoading, setchannelsLoading] = React.useState(false);
  const [authGmailDone, setauthGmailDone] = React.useState(false);
  const [authSlackDone, setauthSlackDone] = React.useState(false);
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
        if (res.data.gmailToken) setauthGmailDone(true);
        if (res.data.slack_info.userid) setauthSlackDone(true);
        setAupData(res.data);
        console.log(res.data);
      });
  }, []);
  const authGmail = () => {
    var myWindow = window.open(
      "http://localhost:4000/api/google",
      "myWindow",
      "width=400, height=600"
    );
    const checkWindow = () => {
      if (!myWindow.closed) return;
      clearInterval(inter);
      setauthGmailDone(true);
      console.log("Gmail Authenticated");
    };
    var inter = setInterval(checkWindow, 1000);
  };

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
    setchannelsLoading(true);
    axios
      .get("http://localhost:4000/api/slack/getChannelList", {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);
        setChannels(res.data.channels);
        setchannelsLoaded(true);
        setchannelsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const sendMessage = () => {
    axios
      .get("http://localhost:4000/api/slack/send", {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const submit = () => {
    //console.log(.name);
    /* */
  };
  const menue = channels.map((v, i) => (
    <Menu.Item>
      <Button
        onClick={(e) => {
          console.log(e.target.innerHTML);
          channels.map((a, b) => {
            if (a.name == e.target.innerHTML) {
              const _id = a.id;
              console.log(_id);
              axios({
                method: "post",
                url: "http://localhost:4000/api/slack/getchannelid",
                data: { _id },
                withCredentials: true,
              })
                .then((res) => {
                  if (res.status == 200) {
                    console.log("Sucess");
                  }
                })
                .catch((e) => console.log(e.message));
            }
          });
        }}
      >
        {v.name}
      </Button>
    </Menu.Item>
  ));
  return (
    <div>
      <Title level={3} style={{ textAlign: "center" }}>
        Configure workflow {aupData.aupName}
      </Title>
      <WorkflowCard title="Gmail">
        {!authGmailDone ? (
          <Button type="primary" shape="round" onClick={authGmail}>
            Auth Gmail
          </Button>
        ) : (
          <div className="change-email">
            <Button type="primary" shape="round" onClick={authGmail}>
              Change gmail account
            </Button>
            <Text type="secondary" style={{ fontSize: 10 }}>
              Currently Authenticated as {aupData.gmailID}
            </Text>
          </div>
        )}
        {authGmailDone ? (
          <div className="change-email">
            <Dropdown
              overlay={
                <Menu>
                  {gmailType.map((v, i) => {
                    console.log(v);
                    return (
                      <Menu.Item>
                        <Text
                          onClick={(e) => {
                            console.log(e.target.innerHTML);
                            // return;
                            axios({
                              method: "post",
                              url:
                                "http://localhost:4000/api/google/gmail/watch",
                              data: { watch_param: e.target.innerHTML },
                              withCredentials: true,
                            })
                              .then((res) => {
                                if (res.status == 200) {
                                  console.log(res.data);
                                }
                              })
                              .catch((e) => console.log(e.message));
                          }}
                        >
                          {v}
                        </Text>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
              placement="bottomCenter"
              arrow
            >
              <Button>Type of gmail notifications</Button>
            </Dropdown>
            {aupData.gmail_trigger_content ? (
              <Text type="secondary" style={{ fontSize: 10 }}>
                Current Trigger {aupData.gmail_trigger_content}
              </Text>
            ) : null}
          </div>
        ) : null}
      </WorkflowCard>
      <Divider orientation="center">
        <PlusCircleOutlined />
      </Divider>
      <WorkflowCard title="Slack">
        {authSlackDone ? null : (
          <Button type="primary" shape="round" onClick={authSlack}>
            Auth Slack
          </Button>
        )}
        <Button type="primary" shape="round" onClick={selectChannel}>
          Get Channel
        </Button>
        {channelsLoading ? "loading..." : null}
        {channelsLoaded ? (
          <Dropdown
            overlay={<Menu>{menue}</Menu>}
            placement="bottomCenter"
            arrow
          >
            <Button>Channel List</Button>
          </Dropdown>
        ) : null}{" "}
        <Button type="primary" shape="round" onClick={sendMessage}>
          Send Message
        </Button>
      </WorkflowCard>
    </div>
  );
}

{
  /* <h1>Hello</h1>
      <p>{match.params.id} wale route pe ho bc</p>

      
      <Button
        type="primary"
        shape="round"
        onClick={() => {
          axios({
            method: "post",
            url: "http://localhost:4000/api/google/gmail/watch/stop",
            withCredentials: true,
          })
            .then((res) => {
              if (res.status == 200) {
                console.log(res);
              }
            })
            .catch((e) => console.log(e.message));
        }}
      >
        STOP GMAIL WATCH
      </Button> */
}

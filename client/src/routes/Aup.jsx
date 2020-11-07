import React from "react";
import axios from "axios";
import { Button } from "antd";
import { useCookies } from "react-cookie";
import { Menu, Dropdown, Button } from "antd";

const gmailType = ["NEW_MESSAGES", "STAR", "FROM_ONLY"];

export default function Aup({ match }) {
  const [aupData, setAupData] = React.useState({});
  const [channels, setChannels] = React.useState([]);
  const [channelsLoaded, setchannelsLoaded] = React.useState(false);
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
  const authGmail = () => {
    var myWindow = window.open(
      "http://localhost:4000/api/google",
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
      .get("http://localhost:4000/api/slack/getChannelList", {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);
        setChannels(res.data.channels);
        setchannelsLoaded(true);
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
      <h1>Hello</h1>
      <p>{match.params.id} wale route pe ho bc</p>

      <Button type="primary" shape="round" onClick={authGmail}>
        Auth Gmail
      </Button>
      <Dropdown
        overlay={
          <Menu>
            {gmailType.map((v, i) => {
              console.log(v);
              return (
                <Menu.Item>
                  <Button
                    onClick={(e) => {
                      console.log(e.target.innerHTML);

                      axios({
                        method: "post",
                        url: "http://localhost:4000/api/google/gmail/watch",
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
                  </Button>
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
      </Button>
      <Button type="primary" shape="round" onClick={authSlack}>
        Auth Slack
      </Button>
      <Button type="primary" shape="round" onClick={selectChannel}>
        Get Channel
      </Button>
      <Button type="primary" shape="round" onClick={sendMessage}>
        Send Message
      </Button>
      {channelsLoaded ? (
        <Dropdown overlay={<Menu>{menue}</Menu>} placement="bottomCenter" arrow>
          <Button>Channel List</Button>
        </Dropdown>
      ) : null}
    </div>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import Login from "../components/Login";
// import { Input } from 'antd';
import { Button, Input } from "antd";
import { Redirect } from "react-router-dom";

function Comp() {
  const [loading, setLoading] = useState(false);
  const [redirect, setredirect] = useState(false);
  const [auth, setAuth] = useState(false);
  const [aup, setAup] = useState("");
  const [aupID, setAupID] = useState("");
  // const [aup, setAup] = useState("");
  const [user, setUser] = useState({});

  useEffect(() => {
    axios
      .get("/api/checktoken", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          setAuth(true);
          setUser({ email: res.data });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
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
      "http://localhost:4000/slack",
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

  const sendMessage = () => {
    axios
      .get("http://localhost:4000/getChannelList")
      .then((res) => {
        console.log("uu");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const createAUP = () => {
    axios({
      method: "post",
      url: "http://localhost:4000/api/aup/create",
      data: { aup },
      withCredentials: true,
    })
      .then((res) => {
        if (res.status == 200) {
          setredirect(true);
          setAupID(res.data.id);
        }
      })
      .catch((e) => console.log(e.message));
  };
  if (redirect)
    return (
      <Redirect
        to={{
          pathname: `/aup/${aupID}`,

          // state: { referrer: currentLocation },
        }}
      />
    );
  return (
    <>
      {auth ? (
        "DONE!"
      ) : (
        <>
          <Login />
          <Login isLogin={true} />
        </>
      )}

      <Button type="primary" shape="round" onClick={authGmail}>
        Auth Gmail
      </Button>
      <Button type="primary" shape="round" onClick={authSlack}>
        Auth Slack
      </Button>
      <Button type="primary" shape="round" onClick={sendMessage}>
        Get Channel List
      </Button>
      <Input type="text" value={aup} onChange={(e) => setAup(e.target.value)} />
      <Button type="primary" shape="round" onClick={createAUP}>
        Create AUP
      </Button>
    </>
  );
}

export default Comp;

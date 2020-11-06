import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import OauthPopup from "react-oauth-popup";
import Login from "./components/Login";

function Comp() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState({});
  // const [popup, setPopup] = useState(false);
  const onCode = (code, params) => {
    console.log("wooooo a code", code);
    console.log(
      "alright! the URLSearchParams interface from the popup url",
      params
    );
  };

  const onClose = (e) => {
    console.log(e);
    axios
      .get("http://localhost:4000/list", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
      });
  };

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
      "http://localhost:4000/google",
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
      {/* <OauthPopup
        url="http://localhost:4000/google"
        onCode={onCode}
        onClose={onClose}
      >
        <div>Click me to open a Popup</div>
      </OauthPopup> */}
      <button onClick={authGmail}>Auth Gmail</button>
    </>
  );
}

export default Comp;

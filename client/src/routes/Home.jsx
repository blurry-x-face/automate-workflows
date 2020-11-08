import axios from "axios";
import { useEffect, useState } from "react";
import Login from "../components/Login";
// import { Input } from 'antd';
import { Button, Input, Divider } from "antd";
import { Redirect } from "react-router-dom";

function Comp(props) {
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
          props.history.push("/workflows/create")
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

  return (
    <>
      <img
        src="https://rishabhshukla.netlify.app/static/media/wave.f230a8cb.svg"
        className="image-element-1"
      />
      <img
        src="https://rishabhshukla.netlify.app/static/media/wave.f230a8cb.svg"
        className="image-element-2"
      />
      {auth ? (
        "DONE!"
      ) : (
        <div className="home-page">
          <Login />
          <Divider orientation="center">or</Divider>
          <Login isLogin={true} />
        </div>
      )}
      {/* <Input type="text" value={aup} onChange={(e) => setAup(e.target.value)} />
      <Button type="primary" shape="round" onClick={createAUP}>
        Create AUP
      </Button> */}
    </>
  );
}

export default Comp;

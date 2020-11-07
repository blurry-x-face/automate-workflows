import axios from "axios";
import { useEffect, useState } from "react";
import Login from "../components/Login";
// import { Input } from 'antd';
import { Button, Input } from "antd";
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
    <>
      {auth ? (
        "DONE!"
      ) : (
        <>
          <Login />
          <Login isLogin={true} />
        </>
      )}
      <Input type="text" value={aup} onChange={(e) => setAup(e.target.value)} />
      <Button type="primary" shape="round" onClick={createAUP}>
        Create AUP
      </Button>
    </>
  );
}

export default Comp;

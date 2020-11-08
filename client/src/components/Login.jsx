import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Input } from "antd";
import { Button } from "antd";
import { Redirect } from "react-router-dom";
import photo from "../assets/undraw_Confirmation_re_b6q5.svg";

export default function Login(props) {
  const { isLogin } = props;
  const [email, setEmail] = React.useState("");
  const [ssRedirect, setIsRedirect] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [cookies, setCookie] = useCookies(["token"]);

  const doSomething = () => {
    let type;
    type = isLogin ? "login" : "register";
    axios
      .post(`http://localhost:4000/api/user/${type}`, {
        email,
        password,
      })
      .then((response) => {
        console.log(response);
        if (response.status !== 200) {
          return;
        }
        setIsRedirect(true);
        // props.history.push("/workflows/create");
        setCookie("token", response.data.token, { path: "/" });
      })
      .catch((err) => console.error(err));
  };
  if (ssRedirect) return <Redirect to="/workflows/create" />;
  return (
    <div className="auth-card">
      {!isLogin ? (
        <div>
          <h3 style={{ textAlign: "center" }}>Welcome to Workflows</h3>
          <img src={photo} style={{ height: "15vw" }} />
        </div>
      ) : null}
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <Button
        type="primary"
        shape="round"
        // icon={<DownloadOutlined />}
        // size={size}
        onClick={doSomething}
      >
        {isLogin ? "Login" : "Register"}
      </Button>
    </div>
  );
}

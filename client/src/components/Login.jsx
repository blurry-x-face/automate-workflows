import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Input } from "antd";
import { Button } from "antd";

export default function Login({ isLogin }) {
  const [email, setEmail] = React.useState("");
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
          // setError(response.data.message);
          return;
        }
        setCookie("token", response.data.token, { path: "/" });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        value={password}
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

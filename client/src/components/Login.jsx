import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

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
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={doSomething}>{isLogin ? "Login" : "Register"}</button>
    </div>
  );
}

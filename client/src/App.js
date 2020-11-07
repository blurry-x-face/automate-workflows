import React, { useEffect, useContext } from "react";
import { Link, Route, Switch } from "react-router-dom";
import Home from "./routes/Home";
import axios from "axios";
import Aup from "./routes/Aup";
import { Context } from "./Store";
import Layout from "./components/Layout";
import Workflows from "./routes/Workflows";

import "antd/dist/antd.css"; // or 'antd/dist/antd.less'

import "./App.css";
import CreateWorkflows from "./routes/CreateWorkflows";

export default function App() {
  const [state, dispatch] = useContext(Context);

  useEffect(() => {
    axios
      .get("/api/checktoken", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          dispatch({
            type: "VERIFY_AUTH",
            payload: {
              isAuth: true,
              email: "sad",
            },
          });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Layout>
        <Route path="/aup/:id" exact component={Aup} />
        <Route path="/workflows/create" exact component={CreateWorkflows} />
        <Route path="/workflows" exact component={Workflows} />
      </Layout>
    </Switch>
  );
}

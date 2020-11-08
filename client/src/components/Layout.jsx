import React from "react";
import { Layout, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  SlidersOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import Logout from "./Logout";

const { Header, Sider, Content } = Layout;
export default class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    return (
      <Layout>
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ marginTop: "12vh" }}
          >
            <Menu.Item
              key="1"
              // onClick={() => this.props.history.push("/workflows")}
              icon={<UnorderedListOutlined />}
            >
              <Link to="/workflows"> Workflows</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<SlidersOutlined />}>
              <Link to="/workflows/create"> Create</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<LogoutOutlined />}>
              <Logout />
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            {React.createElement(
              this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: this.toggle,
              }
            )}
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
            }}
          >
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

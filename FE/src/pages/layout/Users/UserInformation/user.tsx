import { css } from "@emotion/react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Dropdown, Popover, Button, message } from "antd";
import { SettingOutlined, LogoutOutlined, ProfileOutlined, HistoryOutlined } from "@ant-design/icons";
import ChangePassword from "./changePassword";
import UserProfile from "./userProfile";
const { Item, Divider } = Menu;
import { HiOutlineLogout } from "react-icons/hi";
import { AiOutlineSetting } from "react-icons/ai";
import { FiUserCheck } from "react-icons/fi";
import { TbPassword } from "react-icons/tb";
const UserInformation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(user?.role?.role_name === "admin" || user?.role?.role_name === "quản lý" || user?.role?.role_name === "nhân viên");
  }, [user]);

  const handleShowChangePassword = () => {
    setShowChangePassword(true);
    setShowMenu(false);
    setShowProfile(false);
  };

  const handleHideChangePassword = () => {
    setShowChangePassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();
    message.success("Đã đăng xuất thành công");
    navigate("/");
  };

  const handleMenuClick = (e: any) => {
    if (e.key === "profile") {
      setShowProfile(true);
      setShowMenu(false);
    } else if (e.key === "logout") {
      handleLogout();
    }
  };

  const handleVisibleChange = (visible: boolean) => {
    setShowMenu(visible);
  };

  const handleProfileClose = () => {
    setShowProfile(false);
  };

  const formatDate = (dateString: string) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const profileFields = [
    { label: "Tên", value: user.name },
    { label: "Họ Và Tên", value: user.fullname },
    { label: "Email", value: user.email },
    { label: "Ngày sinh", value: formatDate(user.ngaysinh) },
    // Thêm các trường thông tin người dùng khác vào đây
  ];

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Item key="profile"><ProfileOutlined /> Hồ sơ</Item>
      <Item key="history">
        <Link to="/order-history"><HistoryOutlined /> Lịch sử mua hàng</Link>
      </Item>
      <Item key="changePassword" onClick={handleShowChangePassword}>
        <span className="flex"><TbPassword /> Đổi mật khẩu</span>
      </Item>
      <Item key="logout">
        <p className=" font-normal text-[15px] hover:text-red-500">
          <LogoutOutlined /> Đăng xuất
        </p>
      </Item>
      <Divider />
      {isAdmin && (
        <Item>
          <div onClick={handleProfileClose}>
            <Link
              to={"/admin"}
              className="inline-block w-[100%] font-normal rounded-[8px] text-[15px] hover:bg-[#ffaa00] p-3"
            >
              Quản lý website
            </Link>
          </div>
        </Item>
      )}
    </Menu>
  );

  return (
    <div>
      {user && user.name ? (
        <div>
          <Dropdown
            overlay={menu}
            onVisibleChange={handleVisibleChange}
            visible={showMenu}
            trigger={["click"]}
          >
            <button
              type="button"
              className="group flex shrink-0 items-center rounded-lg transition"
            >
              <span className="sr-only">Menu</span>
              <FiUserCheck />
              <p className="ms-2 hidden text-left text-xs sm:block ">
                <strong className="block font-medium text-sm">
                  {user.name}
                </strong>
              </p>
            </button>
          </Dropdown>

          {showChangePassword && (
            <Popover
              visible={showChangePassword}
              content={
                <ChangePassword
                  handleHideChangePassword={handleHideChangePassword}
                />
              }
              trigger="click"
              placement="bottom"
            ></Popover>
          )}

          {showProfile && (
            <Popover
              visible={showProfile}
              content={
                <UserProfile
                  handleHideUserProfile={() => setShowProfile(false)}
                />
              }
              trigger="click"
              placement="bottom"
            ></Popover>
          )}
        </div>
      ) : (
        <div>
          <Link to="/signin">
            <Button className="login-button rounded-lg">Đăng nhập</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserInformation;
const cssMenuDrawer = css`
  div {
    padding: 10px;
    font-size: 16px;
  }
  div:hover {
    background-color: #f5f5f5;
  }
  div a:hover {
    color: red;
  }
  .mobile-menu .ant-menu-item {
    padding-left: 40px !important;
  }
  .mobile-menu .ant-menu-sub {
    background-color: transparent !important;
  }
`;
const cssMenu = css`
  @media not all and (min-width: 640px) {
    display: none;
  }
  display: flex;
  color: #221f20;
  font-weight: 600;
  text-transform: uppercase;
  font-family: "Montserrat", sans-serif !important;
  font-size: 12px;
  .news-product {
    list-style: none;
    background-color: white;
    position: absolute;
    top: 17px;
    width: 216px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e7e8e9;
    border-right: 1px solid #e7e8e9;
    padding: 5px;
    border-radius: 4px;
    z-index: 1;
    visibility: hidden;
    border-radius: 8px;
  }
  .news-product a {
    margin: 4px;
  }
  .news-product a:hover {
    background-color: rgba(39, 39, 42, 0.12);
    border-radius: 8px;
  }
  .title:hover .news-product {
    visibility: visible;
  }
  .title {
    cursor: pointer;
    position: relative;
  }
`;
const cssWrapperMenu = css`
  .links {
    font-size: 16px;
    list-style: none;
    background-color: white;
    position: absolute;
    border-left: 1px solid #e7e8e9;
    border-right: 1px solid #e7e8e9;
    border-bottom: 1px solid #e7e8e9;
    top: 30px;
    right: -16px;
    width: 162px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    border-radius: 4px;
    z-index: 1;
    visibility: hidden;
  }
  .links svg {
    display: inline-block;
    margin-right: 8px;
  }
  .links p:hover {
    background-color: rgba(39, 39, 42, 0.12);
    border-radius: 8px;
  }
  .item-menu:hover .links,
  .links:hover {
    visibility: visible;
  }
  .item-menu {
    display: none;
  }
  @media screen and (min-width: 640px) {
    .item-menu {
      display: flex;
      padding: 8px 16px;
      align-items: center;
      border-radius: 8px;
      cursor: pointer;
      justify-content: flex-end;
      border: 1px solid rgba(39, 39, 42, 0.12);
      margin: 0 4px;
      .icon {
        margin-right: 4px;
        font-size: 22px;
      }
    }

    .title {
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      position: relative;
    }
  }
  .item-menu:hover {
    background-color: rgba(39, 39, 42, 0.12);
    border: 1px solid rgba(39, 39, 42, 0.11);
  }
  .hr-height {
    width: 1px;
    border: 1px solid rgba(39, 39, 42, 0.12);
    margin: 0 4px;
  }
`;
const cssCartMain = css`
  .show-count {
    top: -4px;
    right: -4px;
    border-radius: 50px;
    background: #ef4444;
    font-size: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    width: 12px;
    height: 12px;
  }
  @media screen and (min-width: 640px) {
    .show-count {
      top: 0px;
      right: 0px;
      font-size: 1.3rem;
      width: 20px;
      height: 20px;
    }
  }

  position: relative;
  display: block;
  height: 100%;
  padding: 8px 14px;
  font-size: 22px;
  border-radius: 8px;
  color: var(--color-black);
  cursor: pointer;

  @media (min-width: 0) and (max-width: 739px) {
    padding: 0;
    margin-left: 10px;
  }
`;
const cssDarkScreen = css`
  z-index: 10;
  opacity: 0.5;
  position: fixed;
  width: 100%;
  top: 95px;
  bottom: 0;
  left: 0;
  right: 0;
`;
const cssMarquee = css`
  .rfm-marquee:hover {
    animation-play-state: paused;
  }
`;

import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Spin,
  notification,
  Select,
  Input,
  DatePicker,
} from "antd";
import { FolderViewOutlined } from "@ant-design/icons";
import { IUser } from "@/interfaces/user";
import { Link, useNavigate } from "react-router-dom";
import { ISOrder } from "../../../interfaces/orders";
import {
  useGetAllOrdersInAdminQuery,
  useUpdateOrderMutation,
  useGetAllOrdersQuery,
} from "../../../api/order";
import { useGetUserQuery } from "@/api/user";
import axios from "axios";
import "./a.css";
const { RangePicker } = DatePicker;

function App() {
  const navigate = useNavigate();
  const [updateOrder] = useUpdateOrderMutation();
  // const { data:orders} = useGetAllOrdersInAdminQuery();
  const { data: orderClient } = useGetAllOrdersQuery();
  const { data: users } = useGetUserQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const arrStatus = [
    { value: "pending", label: "Chờ xác nhận shop" },
    { value: "waiting", label: "Chờ vận chuyển" },
    { value: "delivering", label: "Đang vận chuyển" },
    { value: "done", label: "Thành công" },
    { value: "cancel", label: "Đã hủy" },
  ];
  const arrStatusFillter = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận shop" },
    { value: "waiting", label: "Chờ vận chuyển" },
    { value: "delivering", label: "Đang vận chuyển" },
    { value: "done", label: "Thành công" },
    { value: "cancel", label: "Đã hủy" },
  ];

  const handelChangeObject = (address: string) => {
    return JSON.parse(address);
  };

  const handleStatusChange = (
    recordKey: number | string,
    value: string,
    record: any
  ) => {
    updateOrder({ status: value, _id: record.code }).then(() =>
      navigate("/admin/order")
    );
    handleFilterStatus(status);
    // Thêm các xử lý khác tùy vào nhu cầu của bạn
  };
  
  let dataSource = [];
  dataSource = orderClient?.data.map((order: ISOrder) => ({
    code: order._id._id,
    name: order.user.name,
    status: order.status,
    address: order.address,
    product: order.products,
    moneny: order.total_price,
  }));
  if (status) {
    dataSource = dataSource.filter((order: ISOrder) => order.status == status);
  }
  if (userName) {
    dataSource = dataSource.filter((order: ISOrder) => order.name == userName);
  }
  if (code) {
    dataSource = dataSource.filter((order: ISOrder) => order.code == code);
  }
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Người mua",
      dataIndex: "name",
      render: (data: any) => {
        return <p>{data}</p>;
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (data: any) => {
        return <p>{handelChangeObject(data).address}</p>;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "address",
      render: (data: any) => {
        return <p>{handelChangeObject(data).phone}</p>;
      },
    },
    {
      title: "Số tiền",
      dataIndex: "moneny",
      key: "moneny",
      render: (data: any) => {
        return (
          <p>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data)}
          </p>
        );
      },
    },
    {
      title: "Số sản phẩm",
      dataIndex: "product",
      render: (data: any) => {
        return <p>{data.length}</p>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusLabel = arrStatus.find((item) => item.value === status);
        return statusLabel ? statusLabel.label : "";
      },
    },
    {
      title: "Action",
      key: "action",
      render: ({ code: id }: { code: number | string }) => {
        return (
          <div className="flex items-center">
            <Link
            to={`/admin/order/${id}` }
            className="px-3  text-xl rounded-md border border-gray-300">
            <Link />
                <FolderViewOutlined className="flex items-center py-[5px]" />
            </Link>
          </div>
        );
      },
    },
  ];

  const handleFilterStatus = (value: string) => {
    setStatus(value);
    setFilterStatus(value);
  };
  const onChangeSearchName = (e) => {
    setUserName(e.target.value.trim());
  };
  const onChangeSearchCode = (e) => {
    setCode(e.target.value.trim());
  };
  const onChangeSearchOrderDate = (e) => {
    setOrderDate(e);
  };
  return (
    <>
      <header>
        <div className="flex justify-between">
          <h2 className="text-2xl">Quản lý hóa đơn</h2>
        </div>
        <div className="mt-2 flex">
          <Input
            placeholder="Tìm hóa đơn theo mã đơn"
            value={code}
            onChange={onChangeSearchCode}
            style={{ width: 200 }}
          />
          <Input
            className="ml-3"
            value={userName}
            onChange={onChangeSearchName}
            placeholder="Tìm hóa đơn theo tên người mua"
            style={{ width: 200 }}
          />
          {/*<RangePicker className='ml-3' value={orderDate}  onChange={onChangeSearchOrderDate}/>*/}
        </div>
        <div className="mt-2 flex">
            {arrStatusFillter.map((option) => (
              <Button
                key={option.value}
                type={filterStatus === option.value ? "default" : "link"}
                onClick={() => handleFilterStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
      </header>
      <>
        <Table className="mt-4" dataSource={dataSource} columns={columns} />;
      </>
    </>
  );
}

export default App;

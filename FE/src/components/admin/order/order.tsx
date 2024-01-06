import React, { useEffect, useState } from 'react';
import { Button, Table, Spin, notification, Select, Input, DatePicker } from 'antd';
import { FolderViewOutlined } from '@ant-design/icons';
import { IUser } from "@/interfaces/user";
import { Link, useNavigate } from 'react-router-dom';
import { ISOrder } from '../../../interfaces/orders'; 
import { useGetAllOrdersInAdminQuery, useUpdateOrderMutation , useGetAllOrdersQuery } from '../../../api/order';
import { useGetUserQuery } from "@/api/user";
import axios from 'axios';
import './a.css';
const { RangePicker } = DatePicker;

function App() {
  const navigate = useNavigate();
  const [updateOrder] = useUpdateOrderMutation();
  const { data:orders} = useGetAllOrdersQuery();
  const { data: users } = useGetUserQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [status , setStatus] = useState('pending');

  const arrStatus = [
    { value: 'pending', label: 'Chờ xác nhận shop' },
    { value: 'waiting', label: 'Chờ vận chuyển' },
    { value: 'delivering', label: 'Đang vận chuyển' },
    { value: 'done', label: 'Thành công' },
    { value: 'cancel', label: 'Đã hủy' },
  ];
  
  const handleStatusChange = (recordKey: number | string, value: string, record:any) => {    
    updateOrder({ "status": value, _id: record.code })
     .then(() => navigate("/admin/order"));
    handleFilterStatus(status);
    // Thêm các xử lý khác tùy vào nhu cầu của bạn
  };
  const dataSource = orders?.data?.data.filter((order: ISOrder) => order.status == status).map((order: ISOrder) => ({
    code: order._id,
    name: order.user_id,
    status: order.status,
    address: order.address,
    product: order.products,
    moneny: order.total_price
  }));  

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Người mua',
      dataIndex: 'name',
      render: (data: any) => {
        return <p>{
         data
        }</p>;
      },
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Số tiền',
      dataIndex: 'moneny',
      key: 'moneny',
      render: (data: any) => {
        return <p>{
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(data)}</p>;
      },
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'product',
      render: (data: any) => {
        return <p>{
          data.length
        }</p>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (data: string, record: any) => {
        return (
          <Select
            className='ml-2'
            defaultValue={data}
            style={{ width: 150 }}
            options={arrStatus}
            onChange={(value) => handleStatusChange(record.key, value,record)}
          />
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: ({ key: id }: { key: number | string }) => {
        return (
          <>
            <Button>
              <Link to={`/admin/product/update/${id}`}><FolderViewOutlined /></Link>
            </Button>
          </>
        );
      },
    },
  ];

  const handleFilterStatus = (value: string) => {
    setStatus(value);
  }

  return (
    <>
      <header>
        <div className="flex justify-between">
          <h2 className="text-2xl">Quản lý hóa đơn</h2>
        </div>
        <div className="mt-2 flex">
          <Input
            placeholder="Tìm hóa đơn theo mã đơn"
            style={{ width: 200 }}
          />
          <Input
            className='ml-3'
            placeholder="Tìm hóa đơn theo tên người mua"
            style={{ width: 200 }}
          />
          <RangePicker className='ml-3' />
          <Select
            className='ml-2'
            defaultValue={status}
            style={{ width: 200 }}
            options={arrStatus}
            onChange={handleFilterStatus}
          />
        </div>
      </header>
      <>
        <Table className='mt-4' dataSource={dataSource} columns={columns} />;
      </>
    </>
  );
}

export default App;

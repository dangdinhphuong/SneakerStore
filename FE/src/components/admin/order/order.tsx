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
  const [status , setStatus] = useState('');
  const [userName , setUserName] = useState('');
    const [code , setCode] = useState('');
  const [orderDate , setOrderDate] = useState('');

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
  let dataSource = [];
  dataSource = orderClient?.data.map((order: ISOrder) => (
      {
        code: order._id._id,
        name: order.user.name,
        status: order.status,
        address: order.address,
        product: order.products,
        moneny: order.total_price
      }
  ));
  if(status){
    dataSource = dataSource.filter((order: ISOrder) => order.status == status);
  }
  if(userName){
    dataSource = dataSource.filter((order: ISOrder) => order.name == userName);
  }
  if(code){
    dataSource = dataSource.filter((order: ISOrder) => order.code == code);
  }
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
  const onChangeSearchName = (e) => {
    setUserName(e.target.value.trim())
  }
  const onChangeSearchCode = (e) => {
    setCode(e.target.value.trim())
  }
  const onChangeSearchOrderDate = (e) => {
    setOrderDate(e)
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
            value={code}
            onChange={onChangeSearchCode}
            style={{ width: 200 }}
          />
          <Input
            className='ml-3'
            value={userName}
            onChange={onChangeSearchName}
            placeholder="Tìm hóa đơn theo tên người mua"
            style={{ width: 200 }}
          />
          {/*<RangePicker className='ml-3' value={orderDate}  onChange={onChangeSearchOrderDate}/>*/}
          <Select
            className='ml-2'
            defaultValue={status}
            style={{ width: 200 }}
            options={arrStatusFillter}
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

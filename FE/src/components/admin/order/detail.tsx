import React, { useEffect, useState } from "react";
import { useGetOrderByIdQuery } from "@/api/order";
import { useParams } from "react-router-dom";
import { IProduct } from '../../../interfaces/product';
import ImagePriview from '../../Image/ImagePriview';
import {Table} from "antd";

function Detail() {
    const { id } = useParams<{ id: string }>(); // Get the product id from the URL parameters
    const { data: order, isLoading} = useGetOrderByIdQuery(String(id));
    const [orderChange, setOrderChange] = useState(order);

    
    const arrStatus = [
        { value: "pending", label: "Chờ xác nhận shop" },
        { value: "waiting", label: "Chờ vận chuyển" },
        { value: "delivering", label: "Đang vận chuyển" },
        { value: "done", label: "Thành công" },
        { value: "cancel", label: "Đã hủy" },
    ];
    
    const dataSource = order?.data.products.map((item: {product: Array<object>,quantity: number , color: string , size: string }) => ({
        key: item.product._id,
        image: item.product.image,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size
    }));    

    console.log(dataSource);
    
    const handelChangeObject = (address: string) => {
        return address ? JSON.parse(address) : '';
    };

    const columns = [
        {
            title: "Ảnh",
            dataIndex: "image",
            render: (image: any) => {
                return (
                    <td className="whitespace-nowrap  text-gray-700 py-4 ">
                        <div className="items-center ">
                            <p className="text-xs lg:text-base md:text-xl flex ">
                                <img width={100} src={image} />
                            </p>
                        </div>
                    </td>
                )
            },
        },
        {
            title: "Tên sản phẩm",
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: "Màu sắc",
            dataIndex: 'color',
            render: (color: any) => {
                return (
                    <div
                        className="rounded-full"
                        style={{
                            backgroundColor: color,
                            width: 20,
                            height: 20,
                        }}
                    ></div>
                )
            },
        },
        {
            title: "Kích cỡ",
            dataIndex: 'size',
            key: 'size'
        },
        {
            title: "Giá cả",
            dataIndex: 'price',
            render: (price: any) => {
                return (
                    <p>
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(price)}
                    </p>
                )
            },
        },
        {
            title: "Số lượng",
            dataIndex: 'quantity',
            key: 'quantity'
        },
        {
            title: "Tổng tiền",
            key: 'total',
            render: ({ price: price , quantity: quantity }) => {
                return (
                  <p>
                    {
                        new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(price * quantity)
                    }</p>
                );
              },
        },
    ];

    return (
        <>
            <h2 className="text-2xl">Chi tiết hóa đơn</h2>
            <table className="table-auto">
                <tbody>
                    <tr>
                        <th className="text-left" style={{ width: 200 }}>Mã đơn hàng: </th>
                        <td>{id}</td>
                    </tr>
                    <tr>
                        <th className="text-left">Người mua: </th>
                        <td>{order?.data.user.fullname}</td>
                    </tr>
                    <tr>
                        <th className="text-left">Địa chỉ: </th>
                        <td>{ handelChangeObject(order?.data.address).address}</td>
                    </tr>
                    {order?.data.payment_type == 'bank' && (
                        <tr>
                            <th className="text-left">Loại thanh toán: </th>
                            <td>Thanh toán trực tuyến</td>
                        </tr>
                    )}
                    <tr>
                        <th className="text-left">Trạng thái: </th>
                        <td>{arrStatus.find((item) => item.value === order?.data.status)?.label}</td>
                    </tr>
                    <tr>
                        <th className="text-left">Tổng tiền: </th>
                        <td>{new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(order?.data.total_price)}</td>
                    </tr>
                </tbody>
            </table>
            <>
                <Table className="mt-4" dataSource={dataSource} columns={columns} />;
            </>
        </>
    );
}

export default Detail;

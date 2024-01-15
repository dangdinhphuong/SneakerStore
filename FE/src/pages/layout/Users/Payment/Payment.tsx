import { removeProductToCart, removeMultiplePrdCart } from "@/store/cart/cart.slice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect, useState } from "react";
import { useNewOrderMutation } from "@/api/order";
import { BsFillTrash3Fill } from "react-icons/bs";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
let paymentOrderOne = true;
const userString = localStorage.getItem("user");
const user = userString ? JSON.parse(userString) : {};

const Payment = () => {
    const carts = useAppSelector((state) => state.cart.cart);
    const [checkedItems, setCheckedItems] = useState<any>({});
    const [searchParams] = useSearchParams();
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [newOrder] = useNewOrderMutation();

    const handleSelectAll = () => {
        const newCheckedItems: any = {};
        if (!selectAll) {
            // Chọn tất cả
            carts.forEach((item: any) => {
                newCheckedItems[item._id] = true;
            });
        }
        setCheckedItems(newCheckedItems);
        setSelectAll(!selectAll);
    };

    const handleToTalCart = () => {
        const totalPrice = carts.reduce((value, item) => value + item.quantity * item.product.price, 0);
        const totalQuantity = carts.reduce((total, item) => total + item.quantity, 0);

        return {
            totalQuantity,
            length: carts.length,
            totalPrice,
        };
    };


    const formatPaymentOrder = () => {
        let transformedArray = carts?.map(item => {
            return {
                "product_id": item.product._id,
                "color": item.product.listQuantityRemain[0].colorHex,
                "size": item.product.listQuantityRemain[0].nameSize,
                "quantity": item.quantity
            };
        });

        const dataCreateCart = {
            "user_id": user?._id,
            "status": "pending", // Bạn có thể bỏ qua trường này để sử dụng giá trị mặc định "pending"
            "products": transformedArray,
            "total_price": searchParams.get("amount"),
            "address": sessionStorage.getItem("address") ?? "Địa chỉ của bạn",
            "sale_id": "6555018adbb1621a26e79a3e",
            "total_amount_paid": searchParams.get("amount"),
            "payment_type": "bank",
        };
        return dataCreateCart;
    }

    const createOrder = async (infoOrder) => {
        await newOrder(infoOrder as any).unwrap();
        sessionStorage.removeItem("infoPayment");
        sessionStorage.removeItem("address");
        dispatch(removeMultiplePrdCart(carts?.map((cart: any) => cart.product._id) as any));
        // Cos thể send mail bill ở đây
        navigate("/order-history");
    }

    const paymentOrder = async () => {
        if (
            carts &&
            carts.length > 0 &&
            paymentOrderOne &&
            searchParams.get("resultCode") &&
            searchParams.get("resultCode") == "0") {
           const dataCreateOrder = formatPaymentOrder();
           createOrder(dataCreateOrder);
            console.log('createOrder(dataCreateOrder);', dataCreateOrder,carts)
        }else{
            Swal.fire({
                icon: "error",
                title: "Thanh toán thất bại",
                text: "Vui lòng kiểm tra lại thông tin đơn hàng!",
                footer: '<a href="#">Why do I have this issue?</a>'
              }).then((result) => {
                navigate("/cart");
            });
        }
    }

    useEffect(() => {
        paymentOrder();
      }, []);

    useEffect(() => {
        const handleNewBooking = async () => {


        };
        handleNewBooking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get("payment_id")]);
    useEffect(() => {
        const allChecked = carts.every((item: any) => checkedItems[item._id]);
        setSelectAll(allChecked);
    }, [checkedItems, carts]);

    return (
        <div>
            <div className="mt-10">
                <h1 className="text-center font-sans font-bold text-3xl mb-10">Thông Tin Đơn Hàng</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 ">
                    <div className="md:col-span-2 ">
                        <div className="overflow-x-auto mx-10">
                            <table className=" table min-w-full divide-y-2 divide-gray-200 bg-white text-sm ">
                                <thead className="ltr:text-left rtl:text-right ">
                                    <tr>
                                        <th className="whitespace-nowrap py-4   font-medium text-gray-900 text-left">Tên sản phẩm</th>
                                        <th className="whitespace-nowrap py-4  px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">Loại</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Số Lượng</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Giá</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Thành tiền</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 ">
                                    {carts?.map((cart, index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap  text-gray-700 py-4 ">
                                                <div className=" items-center ">
                                                    <p className="text-xs lg:text-base">{cart.product.name}</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap  text-gray-700 py-4 ">
                                                <div className=" items-center ">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs lg:text-base md:text-xl ">colorHex:    {cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.colorHex
                                                        }</span>
                                                        <span className="flex gap-3 rounded-full w-4 h-4 opacity-70"></span>
                                                    </div>
                                                </div>
                                                <span className="  gap-3 text-xs lg:text-base md:text-xl">nameColor:  {
                                                    cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.nameColor
                                                }</span>
                                                <br />
                                                <span className="  gap-3 text-xs lg:text-base md:text-xl">
                                                    nameSize :{
                                                        cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.nameSize
                                                    }
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap text-gray-700 py-4">
                                                <div className="flex items-center text-xs lg:text-xl">
                                                    <div className="">{cart.quantity}</div>
                                                </div>
                                            </td>
                                            <td className=" whitespace-nowrap  text-gray-700  text-xs md:text-base py-4 ">
                                                {cart.product.price?.toLocaleString()} VNĐ
                                            </td>
                                            <td className=" whitespace-nowrap  text-gray-700  text-xs md:text-base py-4 ">
                                                {(cart.product.price * cart.quantity).toLocaleString()} VNĐ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/*  */}
                    <div className="col-span-1 mx-10 ">
                        <div className="mt-4 border border-green-500 rounded-md p-2">
                            <h3 className="text-xl font-semibold">Thông tin thanh toán</h3>

                            <div className="mt-4 space-y-2">
                                <div>Trạng thái đơn : Pending</div>
                                <div>Số lượng sp : {handleToTalCart().totalQuantity} </div>
                                <div>Số điên thoại : 0976594507 </div>
                                <div>Địa chỉ : 0976594507 </div>
                                <hr></hr>
                                <h1><b><div>Thanh toán: 	{handleToTalCart().totalPrice?.toLocaleString()} VNĐ</div></b></h1>
                            </div>
                        </div>

                        <div className="mt-4 col-span-1 ">
                            <div className="">
                                <div className="border-2 p-2">
                                    <h3 className="font-bold px-3">Thông tin điều khoản </h3>
                                    <div className="m-5 flex-col">
                                        Bằng cách đặt đơn hàng, bạn dồng ý với điều khoản sủ dụng và bán hàng của sneakerStore và xác nhận rằng bạn đã đọc
                                        chính sách quyền riêng tư{" "}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;

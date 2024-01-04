import { useNewOrderMutation } from "@/api/order";
import { createPaymentUrl, useNewPaymentMutation } from "@/api/payment";
import { useDecreaseSaleMutation, useGetAllSalesQuery } from "@/api/sale/sale.api";
import { removeMultiplePrdCart } from "@/store/cart/cart.slice";
import { useAppDispatch , useAppSelector } from "@/store/hook";
import { ISale } from "@/types";
import { Input } from "antd";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Orderr = () => {
    const initialCarts = useAppSelector((state: RootState) => state.cart.cart);
    const [carts, setCarts] = useState(initialCarts);
    const [selectedSale, setSelectedSale] = useState<ISale>({} as any);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "banking">("banking");
    const [infoCart, setInfoCart] = useState<any>([]);
    const [address, setAddress] = useState<string>("");

    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { data } = useGetAllSalesQuery();
    const [newPayment] = useNewPaymentMutation();
    const [newOrder] = useNewOrderMutation();
    const [decreaseSale] = useDecreaseSaleMutation();

    const handlePickSale = (sale: ISale) => {
        if (selectedSale?._id === sale._id) return setSelectedSale({} as any);
        setSelectedSale(sale);
    };

    const handlePayment = () => {
        Swal.fire({
            position: "center",
            title: "Warning",
            text: "Bạn chắc chắn muốn thanh toán chứ!!",
            icon: "warning",
            confirmButtonText: "Đồng ý",
            showDenyButton: true,
            returnInputValueOnDeny: false,
            denyButtonText: "Cancel",
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    if (paymentMethod === "banking") {
                        const infoBanking = {
                            vnp_OrderInfo: "Thanh toán đơn hàng",
                            totalPrice: infoCart?.totalPrice - saleMoney || 0,
                            bank_code: "",
                            language: "vn",
                            // Mấy bạn lấy userId lúc đăng nhập truyên vào
                            user: "6533936415fe0386e84bf4b9",
                        };
                        const result = await createPaymentUrl(infoBanking);
                        window.open(result.data.url_redirect, "_self");
                    }

                    if (paymentMethod === "cash") {
                        const infoBanking = {
                            totalPrice: infoCart?.totalPrice || 0,
                            // Mấy bạn lấy userId lúc đăng nhập truyên vào
                            user: "6533936415fe0386e84bf4b9",
                            payment_method: "cash",
                            message: "Thanh toan don hang",
                            status: "pending",
                        };
                        const newPaymentResult = await newPayment(infoBanking as any).unwrap();
                        const infoOrder = {
                            // Laays id user danwg nhap
                            user_id: "65465224dc28e240806b6c74",
                            address: address || 'dia chi',
                            payment_id: newPaymentResult.data._id,
                            products: infoCart?.cartSelected?.map((cart: any) => ({ product_id: cart._id, quantity: cart.quantity })) || [],
                            total_price: infoCart?.totalPrice - saleMoney || 0,
                        };

                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const orderResult = await newOrder(infoOrder as any).unwrap();
                        dispatch(removeMultiplePrdCart(infoCart?.cartSelected?.map((cart: any) => cart._id) as any));
                        // Cos thể send mail bill ở đây
                        navigate("/order-history");
                        toast.success("Đặt hàng thành công");
                        if (selectedSale._id) {
                            decreaseSale(selectedSale._id);
                        }
                        sessionStorage.removeItem("infoPayment");
                    }
                }
            } catch (error: any) {
                toast.error(error?.data?.message);
            }
        });
    };

    const saleMoney = selectedSale?._id
        ? selectedSale.type === "cash"
            ? infoCart?.totalPrice - +selectedSale.sale
            : (infoCart?.totalPrice * +selectedSale.sale) / 100
        : 0;

    useEffect(() => {
        const _infoCart = JSON.parse(sessionStorage.getItem("infoPayment") || "");
        if (_infoCart) setInfoCart(_infoCart);
    }, []);

    useEffect(() => {
        const handleNewBooking = async () => {
            const paymentId = searchParams.get("payment_id");
            if (paymentId) {
                const infoOrder = {
                    user_id: "65465224dc28e240806b6c74",
                    address: address || 'dia chi',
                    payment_id: paymentId,
                    products: infoCart?.cartSelected?.map((cart: any) => ({ product_id: cart._id, quantity: cart.quantity })) || [],
                    total_price: infoCart?.totalPrice - saleMoney || 0,
                };
                // Show Loading
                await newOrder(infoOrder as any).unwrap();
                sessionStorage.removeItem("infoPayment");
                dispatch(removeMultiplePrdCart(infoCart?.cartSelected?.map((cart: any) => cart._id) as any));
                if (selectedSale._id) {
                    decreaseSale(selectedSale._id);
                }
                // Cos thể send mail bill ở đây
                navigate("/order-history");
                toast.success("Đặt hàng thành công");
            }
        };
        handleNewBooking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get("payment_id")]);
    return (
        <div className="mx-5">
            <h3 className="text-x text-[#222] text-center font-bold tracking-wider my-5">Thông Tin đặt Hàng</h3>
            <div className="sm:flex sm:flex-row">
                <div className="border sm:w-6/12 p-10 mr-5 w-full mb-5">
                    <h4 className="text-xl text-[#222]  font-bold tracking-wider my-2">Thông tin người đặt</h4>
                    <div className="flex">
                        <div className="mt-2 mr-3 w-2/4">
                            <label className="mb-3" htmlFor="">
                                Họ:
                            </label>
                            <Input placeholder="Họ....." className="p-3" />
                        </div>
                        <div className="mt-2 w-2/4">
                            <label className="mb-3" htmlFor="">
                                Tên:
                            </label>
                            <Input placeholder="Tên....." className=" p-3" />
                        </div>
                    </div>
                    <div className="mt-2 ">
                        <label className="mb-3" htmlFor="">
                            Số Điện Thoại
                        </label>
                        <Input placeholder="Số điện thoại.." className=" p-3 w-full" />
                    </div>

                    <div className="mt-2 ">
                        <label className="mb-3" htmlFor="">
                            Địa chỉ
                        </label>
                        <Input placeholder="Địa chỉ.." className=" p-3 w-full" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                </div>
                <div className="border sm:w-6/12 p-10 w-full">
                    <h3 className="text-xl text-[#222] font-bold tracking-wider my-2">Hình Thức Thanh Toán</h3>
                    <fieldset className="space-y-4">
                        <legend className="sr-only">Thanh toán trực tuyến</legend>
                        <div>
                            <input
                                type="radio"
                                name="DeliveryOption"
                                value="DeliveryStandard"
                                id="DeliveryStandard"
                                className="peer hidden [&:checked_+_label_svg]:block"
                                defaultChecked
                                onClick={() => setPaymentMethod("banking")}
                            />

                            <label
                                htmlFor="DeliveryStandard"
                                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
                            >
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="hidden h-5 w-5 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>

                                    <p className="text-gray-700">Thanh Toán trực Tuyến</p>
                                </div>
                            </label>
                        </div>

                        <div>
                            <input
                                type="radio"
                                name="DeliveryOption"
                                value="DeliveryPriority"
                                id="DeliveryPriority"
                                className="peer hidden [&:checked_+_label_svg]:block"
                                onClick={() => setPaymentMethod("cash")}
                            />

                            <label
                                htmlFor="DeliveryPriority"
                                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
                            >
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="hidden h-5 w-5 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>

                                    <p className="text-gray-700">Thanh Toán Khi Nhận Được Hàng</p>
                                </div>
                            </label>
                        </div>
                    </fieldset>
                </div>
            </div>
            <h3 className="text-3xl text-[#17c6aa] font-bold tracking-wider my-5 mx-10">Đơn Hàng</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 ">
                <div className="md:col-span-2 ">
                    <div className="overflow-x-auto mx-10">
                        <table className=" table min-w-full divide-y-2 divide-gray-200 bg-white text-sm ">
                            <thead className="ltr:text-left rtl:text-right  ">
                                <tr>
                                    <th className="whitespace-nowrap py-4 px-1 font-medium text-gray-900 text-left text:xs lg:text-xl">Ảnh</th>
                                    <th className="whitespace-nowrap py-4  px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">Tên</th>
                                    <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">Số Lượng</th>
                                    <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">Giá</th>
                                    <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">
                                        Thành tiền
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 ">
                                {carts?.map((cart, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap font-medium text-gray-900 flex text-left py-4">
                                            <div className="relative">
                                                <img src={cart.product.image[0]} className="w-full h-auto lg:w-40 object-cover md:w-40" alt="" />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap text-gray-700 p-2 ">
                                            <div className="items-center ">
                                                <p className="text-xs lg:text-base">{cart.product.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="text-xs lg:text-base md:text-xl flex items-center"><p>Màu:</p> <div className='rounded-full' style={{ backgroundColor: cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.colorHex, width: 20, height: 20 }} ></div></div>
                                                </div>
                                            </div>
                                            <span className="gap-3 text-xs lg:text-base md:text-xl">
                                                Kích cỡ :{
                                                    cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.nameSize
                                                }
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap text-gray-700 py-4">
                                            <div className="flex items-center text-xs lg:text-xl">
                                                <div className="input-number flex items-center">
                                                   {cart.quantity}
                                                </div>
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

                        <div className="">Tổng tiền: {infoCart?.totalPrice?.toLocaleString() || 0} VNĐ</div>
                    </div>
                </div>

                <div className="col-span-1 mx-10 ">
                    <div className="border border-green-500 rounded-md py-2">
                        <h3 className="px-2 text-xl font-semibold">Mã giảm giá</h3>
                        <div className="max-h-[200px] overflow-y-auto space-y-2 px-2">
                            {data?.data.map((sale) => (
                                <div
                                    className={clsx(
                                        "cursor-pointer hover:bg-green-200 mt-4 border border-green-500 rounded-md p-2",
                                        selectedSale._id === sale._id && "bg-green-500"
                                    )}
                                    key={sale._id}
                                    onClick={() => handlePickSale(sale)}
                                >
                                    <span>{sale.name}</span>
                                    <div className="mt-1 flex justify-between">
                                        <span>
                                            -{sale.sale} {sale.type === "cash" ? "Vnd" : "%"}
                                        </span>
                                        <span>sl: {sale.usageLimit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 border border-green-500 rounded-md p-2">
                        <h3 className="text-xl font-semibold">Thông tin thanh toán</h3>

                        <div className="mt-4 space-y-2">
                            <div>Tổng tiền đơn hàng: {infoCart?.totalPrice?.toLocaleString() || 0}</div>
                            <div>
                                Mã giảm giá: {selectedSale?.name} ({selectedSale?.sale})
                            </div>
                            <div>Tổng tiền giảm giá: {saleMoney?.toLocaleString() || 0}</div>
                            <div>Tổng tiền phải thanh toán: {(infoCart?.totalPrice - saleMoney).toLocaleString()} vnd</div>
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
                            <div className="mb-4 mt-20 flex justify-between ">
                                <span className="font-bold text-2xl">Tổng ({infoCart?.length || 0} mặt hàng) </span>
                                <span className="text-2xl ml-auto"> {(infoCart?.totalPrice - saleMoney).toLocaleString()} vnd</span>
                            </div>
                            <button
                                onClick={handlePayment}
                                className="text-xl mb-2 bg-[#17c6aa] text-white h-[60px] w-full flex items-center justify-center font-sans hover:bg-black hover:text-white"
                            >
                                ĐẶT HÀNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orderr;

import { removeProductToCart , updateQuantityCart} from "@/store/cart/cart.slice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect, useState } from "react";
import { BsFillTrash3Fill } from "react-icons/bs";
import { RootState } from 'path-to-your-root-reducer';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Cart = () => {
    const initialCarts = useAppSelector((state: RootState) => state.cart.cart);
    const [carts, setCarts] = useState(initialCarts);
    const [checkedItems, setCheckedItems] = useState<any>({});
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const handleRemove = (id: string) => {
        Swal.fire({
            position: "center",
            title: "Warning",
            text: "Bạn muốn xóa sản phẩm khỏi giỏ hàng!!",
            icon: "warning",
            confirmButtonText: "Đồng ý",
            showDenyButton: true,
            returnInputValueOnDeny: false,
            denyButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(removeProductToCart(id));
                const cartAfter = carts.filter((item: any) => {
                    return item._id !== id;      
                });
                setCarts(cartAfter);
            }
        });
    };

    const handleQuantityDown = (currentQuantity: number,cartId: string) => {
        if(currentQuantity > 1){
            const cartAfter = carts.map((item: any) => {
                if (item._id === cartId) {
                  dispatch(updateQuantityCart({ _id: cartId, quantity: currentQuantity - 1 }))
                  return { ...item, quantity: item.quantity - 1 };
                }else{
                    return item;
                }
            });
            setCarts(cartAfter);
            toast.success("Cập nhật giỏ hàng thành công");
        }else{
            handleRemove(cartId);
        }
    }

    const handleQuantityUp = (currentQuantity: number,cartId: string) => {
            carts.forEach((item: any) => {
            if (item._id === cartId) {
                dispatch(updateQuantityCart({ _id: cartId, quantity: currentQuantity + 1 }))
                toast.success("Cập nhật giỏ hàng thành công");
            }
        });
    }

    // Xử lý khi checkbox con được chọn
    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setCheckedItems({ ...checkedItems, [name]: checked });
    };

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
        const cartSelected = carts.filter((item) => checkedItems[item._id as any]);
        const totalPrice = cartSelected.reduce((value, item) => value + item.quantity * item.product.price, 0);
        return {
            cartSelected,
            length: cartSelected.length,
            totalPrice,
        };
    };

    const handlePayment = () => {
        Swal.fire({
            position: "center",
            title: "Warning",
            text: "Bạn muốn xác nhận thanh toán chứ!!",
            icon: "warning",
            confirmButtonText: "Đồng ý",
            showDenyButton: true,
            returnInputValueOnDeny: false,
            denyButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                const infoPayment = handleToTalCart();

                sessionStorage.setItem("infoPayment", JSON.stringify(infoPayment));
                navigate("/order");
            }
        });
    };

    useEffect(() => {
        const allChecked = carts.every((item: any) => checkedItems[item._id]);
        setSelectAll(allChecked);
    }, [checkedItems, carts]);

    return (
        <div>
            <div className="mt-10">
                <h1 className="text-center font-sans font-bold text-3xl mb-10">Giỏ hàng</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 ">
                    <div className="md:col-span-2 ">
                        <div className="overflow-x-auto mx-10">
                            <table className=" table min-w-full divide-y-2 divide-gray-200 bg-white text-sm ">
                                <thead className="ltr:text-left rtl:text-right ">
                                    <tr>
                                        <td>
                                            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                        </td>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Ảnh</th>
                                        <th className="whitespace-nowrap py-4   font-medium text-gray-900 text-left">Tên sản phẩm</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Số Lượng</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Giá</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left">Thành tiền</th>
                                        <th className="whitespace-nowrap py-4 font-medium text-gray-900 text-left"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 ">
                                    {carts?.map((cart, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    name={cart._id as string}
                                                    checked={checkedItems[cart._id as string] || false}
                                                    onChange={handleCheckboxChange}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap font-medium text-gray-900 flex text-left py-4">
                                                <div className="relative">
                                                    <img src={cart.product.image[0]} className="w-full h-auto lg:w-40 object-cover md:w-40" alt="" />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap  text-gray-700 py-4 ">
                                                <div className=" items-center ">
                                                    <p className="text-xs lg:text-base">{cart.product.name}</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs lg:text-base md:text-xl ">colorHex:    {cart.product.listQuantityRemain?.find((item) => item.color === cart.color)?.colorHex}</span>
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
                                                    <div className="input-number flex items-center  border-2 ">
                                                        <button className="btn-minus flex w-full px-2" onClick={() => handleQuantityDown(cart.quantity,cart._id)}>
                                                            -
                                                        </button>
                                                        <input value={cart.quantity} type="text" className="w-12 text-center border-x-2" />
                                                        <button className="btn-plus px-2" onClick={() => handleQuantityUp(cart.quantity,cart._id)}>
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className=" whitespace-nowrap  text-gray-700  text-xs md:text-base py-4 ">
                                                {cart.product.price?.toLocaleString()} VNĐ
                                            </td>
                                            <td className=" whitespace-nowrap  text-gray-700  text-xs md:text-base py-4 ">
                                                {(cart.product.price * cart.quantity).toLocaleString()} VNĐ
                                            </td>

                                            <td className="whitespace-nowrap cursor-pointer text-gray-700  text-xs lg:text-xl  md:text-xl px-4 py-4 ">
                                                <BsFillTrash3Fill onClick={() => handleRemove(cart._id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/*  */}
                    <div className="col-span-1 mx-10 ">
                        <div className="flex flex-col">
                            <button className="inline-flex  items-center justify-center w-2/3 px-6 py-2 space-x-2 text-sm font-medium text-white transition bg-blue-700 border border-blue-700 rounded appearance-none cursor-pointer select-none hover:border-blue-800 hover:bg-blue-800 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:pointer-events-none disabled:opacity-75">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                    />
                                </svg>
                                <span className="p-2 text-xs lg:text-xl md:text-xl">Refresh...</span>
                            </button>
                            <div className="font-bold text-2xl mt-5">Số lượng: {handleToTalCart().length}</div>
                            <div className="mb-4 mt-5 flex justify-between">
                                <span className="font-bold text-2xl">Tổng: {handleToTalCart()?.totalPrice?.toLocaleString()} vnd </span>
                                <span className="text-2xl ml-auto"></span>
                            </div>
                            <button
                                onClick={handlePayment}
                                className="text-xl mb-2 bg-[#17c6aa] text-white h-[60px] w-full flex items-center justify-center font-sans hover:bg-black hover:text-white"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

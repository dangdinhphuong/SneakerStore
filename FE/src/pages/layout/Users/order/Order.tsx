import { useNewOrderMutation } from "@/api/order";
import { createPaymentUrl, useNewPaymentMutation } from "@/api/payment";
import {
  useDecreaseSaleMutation,
  useGetAllSalesQuery,
  useGetSaleByCodeQuery,
} from "@/api/sale/sale.api";
import { removeMultiplePrdCart } from "@/store/cart/cart.slice";
import { useAppDispatch } from "@/store/hook";
import { ISale } from "@/types";
import { Button, Popconfirm, Input } from "antd";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetSizesQuery } from '@/api/sizes';
import axios from "axios";
const userString = localStorage.getItem("user");
const user = userString ? JSON.parse(userString) : {};

const Orderr = () => {
  const { data: sizeData ,refetch} = useGetSizesQuery();
  const [selectedSale, setSelectedSale] = useState<ISale>({} as any);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "banking">(
    "banking"
  );
  const [infoCart, setInfoCart] = useState<any>(JSON.parse(sessionStorage.getItem("infoPayment") || ""));
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [voucherValue, setVoucherValue] = useState("");

  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data } = useGetAllSalesQuery();
  const [newPayment] = useNewPaymentMutation();
  const [newOrder] = useNewOrderMutation();
  const [decreaseSale] = useDecreaseSaleMutation();
  const [shouldShowDiscountButton, setShouldShowDiscountButton] = useState(true);
  const currentDate = new Date();

  const filteredDataVoucher = data?.data.filter(function(item) {
    // Chuyển đổi expirationDate thành đối tượng Date
    var expirationDate = new Date(item.expirationDate);

    // Kiểm tra nếu expirationDate lớn hơn hoặc bằng ngày hiện tại và usageLimit lớn hơn 0
    return expirationDate >= currentDate && item.usageLimit > 0;
}) ?? [];
  const handlePickSale = (sale: ISale) => {
    console.log('sale',sale);
    // if (selectedSale?._id === sale._id) return setSelectedSale({} as any);
    setVoucherValue(sale.code ?? '');
    // setSelectedSale(sale);
  };

  const removeVoucher = () => {
    setShouldShowDiscountButton(!shouldShowDiscountButton);
    return setSelectedSale({} as any);
  };

  const addVoucher = async () => {
    if (voucherValue && voucherValue !== "") {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/sales/get-by-code/${voucherValue}`
        );

        if (response.data.data) {
          const voucher = response.data.data;
           const expirationDateVocher  = new Date(voucher.expirationDate);
          if (voucher.quantity === -1 || expirationDateVocher < currentDate) {
            // Kiểm tra số lượng giảm giá
            Swal.fire({
              icon: "error",
              title: "Giảm giá '" + voucherValue + "' đã hết hiệu lực",
              text: "Vui lòng chọn một mã giảm giá khác!",
              footer: '<a href="#">Why do I have this issue?</a>',
            });
            return;
          }

          if (selectedSale?._id === voucher._id)
            return setSelectedSale({} as any);
          setShouldShowDiscountButton(!shouldShowDiscountButton);
          setSelectedSale(voucher);
        } else {
          Swal.fire({
            icon: "error",
            title: "Mã giảm giá '" + voucherValue + "' không hiệu lực",
            text: "Vui lòng kiểm tra lại thông tin!",
            footer: '<a href="#">Why do I have this issue?</a>',
          });
        }
      } catch (error) {
        console.error("Error fetching sale by code:", error);
      }
    }
  };
  
  const formatPaymentOrder = (infoCart) => {
    let transformedArray = infoCart?.cartSelected.map((item) => {
      return {
        product_id: item.product._id,
        color: item.nameColor,
        size: item.nameSize,
        quantity: item.quantity,
      };
    });

    const dataCreateCart = {
      user_id: user._id ?? "",
      status: "pending",
      products: transformedArray,
      total_price: Number(infoCart?.totalPrice - saleMoney),
      address: JSON.stringify({'name':name,'phone':phone,"address":address}),
      total_amount_paid: 0,
      payment_type: "bank",
    };

    // Kiểm tra xem selectedSale._id có tồn tại không
    if (selectedSale?._id) {
      // Nếu tồn tại, thêm sale_id vào dataCreateCart
      dataCreateCart.sale_id = selectedSale._id;
    }

    return dataCreateCart;
  };
  const handlePayment = () => {
    if (address == "") {
      toast.error("Vui lòng nhập địa chỉ");
    }
    else if (name == "") {
      toast.error("Vui lòng nhập họ và tên người nhận");
    }
    else if (phone == "") {
      toast.error("Vui lòng nhập số điẹn thoại người nhận");
    } else {
      sessionStorage.setItem('address', JSON.stringify({'name':name,'phone':phone,"address":address}));
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
                request_type: "payWithATM",
                money: infoCart?.totalPrice - saleMoney || 0,
                redirectUrl: "http://localhost:5173/payment",
              };
              const result = await createPaymentUrl(infoBanking);
              console.log("result",result.data.payUrl)
              window.open(result.data.payUrl, "_self");
            }

            if (paymentMethod == "cash") {
              const dataCreateOrder = formatPaymentOrder(infoCart);              
              console.log("infoCart?.cartSelected2", dataCreateOrder);
              const response = await newOrder(dataCreateOrder as any).unwrap();
              console.log(response);
              if (response) {
                dispatch(
                  removeMultiplePrdCart(
                    infoCart?.cartSelected?.map((cart: any) => cart._id) as any
                  )
                );
                // Cos thể send mail bill ở đây
                navigate("/order-history");
                toast.success("Đặt hàng thành công");
                if (selectedSale._id) {
                  decreaseSale(selectedSale._id);
                }
                sessionStorage.removeItem("infoPayment");
                navigate("/order-history");
              }
            }
          }
        } catch (error: any) {
          toast.error(error?.data?.message);
        }
      });
    }
  };
  // const saleMoney = 0;
  const saleMoney = selectedSale?._id
    ? selectedSale?.type === "cash"
      ? infoCart?.totalPrice - +selectedSale.sale
      : (infoCart?.totalPrice * +selectedSale.sale) / 100
    : 0;

  useEffect(() => {
    if (sessionStorage.getItem("infoPayment") == null) {
      navigate("/");
    }
    const _infoCart = JSON.parse(sessionStorage.getItem("infoPayment") || "");
    if (_infoCart) setInfoCart(_infoCart);
  }, []);

  useEffect(() => {
    const handleNewBooking = async () => {
      const paymentId = searchParams.get("payment_id");
      if (paymentId) {
        const infoOrder = {
          user_id: "65465224dc28e240806b6c74",
          address: address || "dia chi",
          payment_id: paymentId,
          products:
            infoCart?.cartSelected?.map((cart: any) => ({
              product_id: cart._id,
              quantity: cart.quantity,
            })) || [],
          total_price: infoCart?.totalPrice - saleMoney || 0,
        };
        // Show Loading
        await newOrder(infoOrder as any).unwrap();
        sessionStorage.removeItem("infoPayment");
        dispatch(
          removeMultiplePrdCart(
            infoCart?.cartSelected?.map((cart: any) => cart._id) as any
          )
        );
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
      <h3 className="text-x text-[#222] text-center font-bold tracking-wider my-5">
        Thông Tin đặt Hàng
      </h3>
      <div className="sm:flex sm:flex-row">
        <div className="border sm:w-6/12 p-10 mr-5 w-full mb-5">
          <h4 className="text-xl text-[#222]  font-bold tracking-wider my-2">
            Thông tin người đặt
          </h4>
          <div className="mt-2 ">
            <label className="mb-3" htmlFor="">
            Họ và tên:
            </label>
            <Input placeholder="Họ và tên:.." className=" p-3 w-full"
                     value={name}
              onChange={(e) => setName(e.target.value)}/>
          </div>
          <div className="mt-2 ">
            <label className="mb-3" htmlFor="">
              Số Điện Thoại
            </label>
            <Input placeholder="Số điện thoại.."
            className=" p-3 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="mt-2 ">
            <label className="mb-3" htmlFor="">
              Địa chỉ
            </label>
            <Input
              placeholder="Địa chỉ.."
              className=" p-3 w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <div className="border sm:w-6/12 p-10 w-full">
          <h3 className="text-xl text-[#222] font-bold tracking-wider my-2">
            Hình Thức Thanh Toán
          </h3>
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
      <h3 className="text-3xl text-[#17c6aa] font-bold tracking-wider my-5 mx-10">
        Đơn Hàng
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 ">
        <div className="md:col-span-2 ">
          <div className="overflow-x-auto mx-10">
            <table className=" table min-w-full divide-y-2 divide-gray-200 bg-white text-sm ">
              <thead className="ltr:text-left rtl:text-right  ">
                <tr>
                  <th className="whitespace-nowrap py-4 px-1 font-medium text-gray-900 text-left text:xs lg:text-xl">
                    Ảnh
                  </th>
                  <th className="whitespace-nowrap py-4  px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">
                    Tên
                  </th>
                  <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">
                    Số Lượng
                  </th>
                  <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">
                    Giá
                  </th>
                  <th className="whitespace-nowrap py-4 px-1  font-medium text-gray-900 text-left text:xs lg:text-xl">
                    Thành tiền
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 ">
                {infoCart?.cartSelected?.map((cart: any) => (
                  <tr className="" key={cart._id}>
                    <td className="whitespace-nowrap font-medium text-gray-900 flex text-left py-4">
                      <div className="relative w-[200px]">
                        <img
                          className="w-full h-auto lg:w-40 object-cover md:w-40"
                          src={cart?.product?.image[0]}
                          alt=""
                        />
                        <span className="text-xs absolute top-0 right-0 bg-green-400 p-1 text-white rounded-full hidden sm:block">
                          50% OFF
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap  text-gray-700 py-4 ">
                      <div className=" items-center ">
                        <p className="text-xs lg:text-xl md:text-xl">
                          {cart.product.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs lg:text-base md:text-xl ">
                            Màu:
                          </span>
                          <span
                            className=" bg-yellow-500 flex  gap-3 rounded-full w-4 h-4 opacity-70"
                            style={{
                              background: cart.product.listQuantityRemain?.find(
                                (item) => item.color === cart.color
                              )?.colorHex,
                            }}
                          ></span>
                        </div>
                      </div>
                      <span className="  gap-3 text-xs lg:text-base md:text-xl">
                        Size:{" "}
                        {
                          cart.nameSize
                        }
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-gray-700 py-4 px-4">
                      {cart.quantity}
                    </td>
                    <td className=" whitespace-nowrap  text-gray-700  text-xs lg:text-xl md:text-xl py-4 px-1 ">
                      {cart.product.price?.toLocaleString()} vnd
                    </td>
                    <td className=" whitespace-nowrap  text-gray-700  text-xs lg:text-xl md:text-xl py-4 px-1 ">
                      {(cart.product.price * cart.quantity)?.toLocaleString()}{" "}
                      vnd
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="">
              Tổng tiền: {infoCart?.totalPrice?.toLocaleString() || 0} VNĐ
            </div>
          </div>
        </div>

        <div className="col-span-1 mx-10 ">
          <div className="border border-green-500 rounded-md py-2">
            <h3 className="px-2 text-xl font-semibold">Mã giảm giá</h3>{" "}
            <br></br>
            <Input
              placeholder="Mã giảm giá.."
              className=" p-3 w-full"
              value={voucherValue}
              onChange={(e) => setVoucherValue(e.target.value)}
            />{" "}
            <br></br>
            <br></br>
            {shouldShowDiscountButton ? (
              <Button
                type="primary"
                className="bg-[#30bf3e] text-white"
                style={{ width: "100%" }}
                onClick={addVoucher}
              >
                Chọn mã giảm giá
              </Button>
            ) : (
              <Button
                type="primary"
                danger
                style={{ width: "100%" }}
                onClick={removeVoucher}
              >
                Xóa mã giảm giá
              </Button>
            )}
            {<div className="max-h-[200px] overflow-y-auto space-y-2 px-2">
                            {filteredDataVoucher.map((sale) => (
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
                        </div>}
          </div>

          <div className="mt-4 border border-green-500 rounded-md p-2">
            <h3 className="text-xl font-semibold">Thông tin thanh toán</h3>

            <div className="mt-4 space-y-2">
              <div>
                Tổng tiền đơn hàng:{" "}
                {infoCart?.totalPrice?.toLocaleString() || 0} vnd
              </div>
              <div>
                Mã giảm giá: {selectedSale?.name} ({selectedSale?.sale})
              </div>
              <div>
                Tổng tiền giảm giá: {saleMoney?.toLocaleString() || 0} vnd
              </div>
              <div>
                Tổng tiền phải thanh toán:{" "}
                {(infoCart?.totalPrice - saleMoney).toLocaleString()} vnd
              </div>
            </div>
          </div>

          <div className="mt-4 col-span-1 ">
            <div className="">
              <div className="border-2 p-2">
                <h3 className="font-bold px-3">Thông tin điều khoản </h3>
                <div className="m-5 flex-col">
                  Bằng cách đặt đơn hàng, bạn dồng ý với điều khoản sủ dụng và
                  bán hàng của sneakerStore và xác nhận rằng bạn đã đọc chính
                  sách quyền riêng tư{" "}
                </div>
              </div>
              <div className="mb-4 mt-20 flex justify-between ">
                <span className="font-bold text-2xl">
                  Tổng ({infoCart?.length || 0} mặt hàng){" "}
                </span>
                <span className="text-2xl ml-auto">
                  {" "}
                  {(infoCart?.totalPrice - saleMoney).toLocaleString()} vnd
                </span>
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

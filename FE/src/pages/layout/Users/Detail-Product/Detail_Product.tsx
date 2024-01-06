import { useGetProductByIdQuery, useGetProductsQuery } from "@/api/product";
import { FcConferenceCall } from "react-icons/fc";
import { TbTruckDelivery } from "react-icons/tb";
import { Link, useParams } from "react-router-dom";
import ImagePriview from "../../../../components/Image/ImagePriview";
import Comment from "../../../../components/admin/comment/Comment";
import "./Detail_Products.css";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addProductToCart } from "@/store/cart/cart.slice";
import { toast } from "react-toastify";
import { Button, Radio } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import Item from "@/components/item/item";
import { IProduct } from "@/interfaces/product";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const Detail_Product = () => {
  const initialCarts = useAppSelector((state: RootState) => state.cart.cart);
  const [carts, setCarts] = useState(initialCarts);
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams<{ id: string }>(); // Get the product id from the URL parameters
  const { data: product, isLoading } = useGetProductByIdQuery(String(id));
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [countQuanytity, setCountQuanytity] = useState(null);
  const { data: productData } = useGetProductsQuery();
  const [dataSourceToRender, setDataSourceToRender] = useState<IProduct[]>([]);
  const [sliderInitialized, setSliderInitialized] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setCarts(initialCarts);
  }, [initialCarts]);

  const handleCountDowQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    if (productData && !sliderInitialized) {
      const updatedDataSource = productData?.products.map(
        ({ ...IProduct }) => ({
          ...IProduct,
        })
      );
      setDataSourceToRender(updatedDataSource);
      setSliderInitialized(true);
    }
  }, [productData, sliderInitialized]);
  //   console.log(dataSourceToRender);

  const handleCountQuanTity = (item: any) => {
    let currentQauntity = 0;
    carts.forEach((cart: any) => {
      if (
        cart.product?._id == id &&
        cart.nameSize == item.nameSize &&
        cart.nameColor == item.nameColor
      ) {
        currentQauntity = cart.quantity;
      }
    });
    console.log(currentQauntity);

    console.log(carts);
    setCountQuanytity(
      item.quantity - currentQauntity < 0 ||
        item.quantity - currentQauntity == 0
        ? 0
        : item.quantity - currentQauntity
    );
    setSelectedSize(selectedSize === item ? null : item);

    if (
      item.quantity - currentQauntity < 0 ||
      item.quantity - currentQauntity == 0
    ) {
      setQuantity(0);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < countQuanytity) {
      setQuantity(quantity + 1);
    } else {
      toast.warning("Số lượng sản phẩm trong kho không đủ");
    }
  };

  // Tôi k biết mấy bạn lam size màu kiểu gì, lên fix tạm mấy bạn vô sửa đoạn đây
  const handleAddProductToCart = () => {
    if (!product?.product) return;
    const _product = product.product;

    if (!selectedColor || !selectedSize) {
      Swal.fire({
        icon: "error",
        title: "Vui làng chon ..",
        text: "Hãy chon màu với khích thức đẻ thêm vào giỏ hàng .",
      });
      return;
    }
    if (quantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Sản phẩm này đã hết hàng.",
      });
      return;
    }
    const infoCart = {
      _id: _product._id,
      maxSize: selectedSize.quantity,
      nameSize: selectedSize.nameSize,
      nameColor: selectedSize.nameColor,
      quantity,
      product: {
        _id: _product._id,
        name: _product.name,
        image: _product.image,
        price: _product.price,
        listQuantityRemain: _product.listQuantityRemain
          .filter(
            (item) => !selectedColor || item.colorHex === selectedColor.colorHex
          )
          .map((item: any, index: number) => item),
        // Note
      },
    };

    const quantityAfter = countQuanytity - quantity;
    setCountQuanytity(quantityAfter);
    setQuantity(quantityAfter == 0 ? 0 : 1);
    dispatch(addProductToCart(infoCart as any));
    toast.success("Thêm sản phẩm vào giỏ hàng thành công");
    // addProductToCart()

    // Update the remaining quantity of the product
    _product.listQuantityRemain = _product.listQuantityRemain.map(
      (item: any) => {
        if (item.colorHex === selectedColor.colorHex) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="w-screen min-h-[300px] mt-10">
        <div className="big-content w-full px-2 md:w-4/5 mx-auto">
          {/* menu */}
          <div className="breadcrumbs">
            <ul className="flex items-center gap-2">
              <Link to={"/"}>
                <li className="underline underline-offset-4 hover:text-[#17c6aa] ">
                  Home
                </li>
              </Link>
              <li className="underline underline-offset-4 hover:text-[#17c6aa] "></li>
              <li>/ {product?.product.categoryId}</li>
              <li>/ {product?.product.name}</li>
            </ul>
          </div>
          {/* name và rating */}
          <div className="name-rating mt-8 md:mt-2">
            <div className="name-product mt-3">
              <h1 className="title-name uppercase font-medium text-[#282828] text-2xl">
                {product?.product.name}
              </h1>
            </div>
          </div>
          {/* Slide và content */}

          <div className="slider-text-content min-w-full  flex flex-col gap-5 mt-8 md:mt-3 md:flex-row justify-between  ">
            {/* slider */}
            <div className="slider w-full md:w-2/5 relative overflow-hidden ">
              <img src={product?.product.image[0]} alt="" />
              {/* sale */}
              <div className="prd-sale absolute top-2 left-1 min-w-[75px]">
                {product?.product.hot_sale > 10 && (
                  <div className=" py-[2px] bg-pink-600 my-1">
                    <span className=" m-2 block  rounded-full text-center text-sm font-medium text-white">
                      {product?.product.hot_sale} sale
                    </span>
                  </div>
                )}
                <div className="prd-sale py-[2px] bg-blue-300">
                  <span className=" m-2 block  rounded-full text-center text-sm font-medium text-white">
                    NEW
                  </span>
                </div>
              </div>
            </div>
            {/* content */}
            <div className="text-content flex-1">
              <div className="info-price flex flex-col md:flex-row gap-5 items-center">
                <>
                  <h1 className="text-3xl font-normal">
                    {product?.product.price}.vnđ
                  </h1>
                  <div className="price-old">
                    <h2 className="text-lg line-through">
                      {product?.product.price}.vnđ
                    </h2>
                    <p className="text-sm font-medium text-[#fb317d]">
                      You Save: %
                    </p>
                  </div>
                </>
              </div>
              <div className="info-desc mt-5">
                <h2 className="text-lg font-medium">Thông tin sản phẩm</h2>
                <p className="break-words mt-3 text-base text-[#282828]">
                  {product?.product.description}
                </p>
              </div>
              <hr className="bg-gray-300 h-1 mx-auto my-4" />
              {/* Status */}
              {/* Options */}
              <div className="options">
                {/* color */}
                <div className="quantity-remain flex items-center gap-10 mt-5">
                  <ul className="flex flex-row items-start gap-2">
                    <h2 className="text-lg font-medium">Màu :</h2>
                    {product?.product.listQuantityRemain
                      .filter(
                        (v, i, a) =>
                          a.findIndex((t) => t.colorHex === v.colorHex) === i
                      )
                      .map((item: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-center justify-center gap-2"
                          onClick={() =>
                            setSelectedColor(
                              selectedColor === item ? null : item
                            )
                          }
                        >
                          <div
                            style={{ backgroundColor: item.colorHex }}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                          >
                            {selectedColor === item && <CheckOutlined />}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
                {/*name color*/}
                {selectedColor && (
                  <div className="quantity-remain flex items-center gap-10 mt-5">
                    <ul className="flex flex-row items-start gap-2">
                      <h2 className="text-lg font-medium">Tên màu :</h2>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full">
                          {selectedColor.nameColor}
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                {/* size */}
                <div className="quantity-remain flex items-center gap-10 mt-5">
                  <ul className="flex flex-row items-start gap-2">
                    <h2 className="text-lg font-medium">Size :</h2>
                    {product?.product.listQuantityRemain
                      .filter(
                        (item) =>
                          !selectedColor ||
                          item.colorHex === selectedColor.colorHex
                      )
                      .map((item: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2"
                          onClick={() => handleCountQuanTity(item)}
                        >
                          <div className="w-7 h-7 border border-gray-500 flex items-center justify-center">
                            {item.nameSize}
                          </div>{" "}
                          {selectedSize === item && <CheckOutlined />}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* quantity by size */}
                <div className="size flex items-center gap-10 mt-5">
                  <ul className="flex items-center gap-2">
                    <div className="quantity flex items-center gap-5">
                      <h2 className="text-lg font-medium">Số Lượng:</h2>
                      <div className="input-number flex items-center  border-2 ">
                        <button
                          className="btn-minus flex w-full px-2"
                          onClick={handleCountDowQuantity}
                        >
                          -
                        </button>
                        <input
                          value={quantity}
                          type="text"
                          className="w-12 text-center border-x-2"
                        />
                        <button
                          className="btn-plus px-2"
                          onClick={handleIncreaseQuantity}
                        >
                          +
                        </button>
                      </div>
                      {typeof selectedSize != null ? (
                        <div className="">
                          {countQuanytity > 0 ? (
                            <div className="available-quantity flex items-center gap-5">
                              <h2 className="text-lg font-medium">
                                Số lượng có sẵn:
                              </h2>
                              <div>{countQuanytity}</div>
                            </div>
                          ) : (
                            <h2 className="text-lg text-red-800 font-medium">
                              {countQuanytity == 0
                                ? "Sản phẩm đã hết hàng"
                                : ""}
                            </h2>
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </ul>
                </div>
                {/* action-button số lượng yêu thích */}
                <div className="action-addtocart mt-5">
                  {/* button */}
                  <div className="button flex items-center gap-4 mt-5">
                    <button
                      disabled={countQuanytity < 0 || countQuanytity == 0}
                      onClick={handleAddProductToCart}
                      className="btn-addtocart flex-1 bg-[#17c6aa] text-white hover:bg-black py-4 rounded-md"
                    >
                      Thêm Vào Giỏ Hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* mô tả và support */}
          <div className="desc-support">
            <div className="info-support flex flex-col gap-10 md:flex-row justify-between items-center bg-white  py-2 px-1 mt-8 md:mt-20">
              <div className="item flex items-center ">
                <i className="text-4xl">
                  <FcConferenceCall />
                </i>
                <span>24/7 Support</span>
              </div>
              <div className="item">
                <span>Use promocode FOXIC to get 15% discount!t</span>
              </div>
              <div className="item flex items-center">
                <i className="text-4xl">
                  <TbTruckDelivery />
                </i>
                <span>Fast Shipping</span>
              </div>
            </div>
            {/* Mô tả */}
            <div className="info-desc mt-8 md:mt-20">
              <h1 className="underline underline-offset-8 text-xl font-semibold my-10">
                Chính Sách Mua Hàng
              </h1>
              <div className="desc flex flex-col-reverse md:flex-row items-start gap-5">
                <p className="mb-5 w-2/3 text-base leading-7 ">
                  ✨Hàng trong kho toàn bộ là hàng có sẵn. Các bạn đặt hàng chọn
                  theo phân loại hàng mình mua là được nhé<br></br>
                  ⚜️GIAO HÀNG TOÀN QUỐC SIÊU NHANH<br></br>
                  ⚜️Thanh toán khi nhận hàng<br></br>
                  🔸Cam kết giá cả cạnh tranh, mẫu mã đa dạng<br></br>
                  🔸Bao chất - bao giá - bao đổi trả nếu hàng kém chất lượng
                  <br></br>✅ Nói không với hàng chợ, hàng kém chất lượng
                  <br></br>✅ Đổi trả hàng không mất phí nếu hàng không giống
                  ảnh trong vòng 3 ngày.
                </p>
              </div>
            </div>
          </div>
          {/* Đánh giá */}
          {/* <div className="rating-user">
                        <h1 className="my-5 text-xl font-medium">Đánh giá và Nhận xét </h1>
                        <div className="shadow-rating-user  min-h-[200px] w-full rounded-lg p-5 ">
                            <div className="content-rating min-h-[200px]  border-2 border-gray-300 rounded-2xl flex items-center">
                                <div className="rating-big border-r-2 p-2 text-center w-1/3 ">
                                    <p> Đánh giá và nhận xét</p>
                                </div>
                                <div className="rating-big-item w-full">


                                </div>
                            </div>
                            button đánh giá
                            <div className="button-rating-and-commnet mt-5 w-full mx-auto flex justify-center items-center ">
                                <button className="btn-rating-and-commnet text-base bg-[#17c6aa] text-white hover:bg-black py-2 px-20 rounded-xl">
                                    Đánh giá ngay
                                </button>
                            </div>
                            user-rating và đánh giá
                            <div className="user-rating-evaluate ">
                                <div className="user-rating-evaluate-item mt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="user-rating-evaluate-item-img w-8 h-8">

                                        </div>
                                        <span className="font-semibold text-base">Đỗ Thành Long</span>
                                    </div>

                                    <div className="user-rating-evaluate-item-content ml-10">

                                        <div className="rating-star bg-blue-gray-50 p-2 rounded-lg">
                                            <div className="flex items-center h-8 ">
                                                <span className="font-semibold text-sm">Đánh giá: </span>
                                                <i className="flex items-center ">  tỷ56tyr4e</i>
                                            </div>
                                            <div className="flex items-center">
                                                <span className=" font-semibold text-sm">Nhận xét: </span>
                                                <p className="flex items-center text-xs">Sản phẩm rất là ok</p>
                                            </div>
                                        </div>

                                    </div>


                                </div>
                            </div>


                          
                        </div>



                    </div> */}
          {/* Coment user */}
          <div className="comment">
            <Comment />
          </div>
          {/* Sản phẩm cùng loại */}
          <div className="prd-cate mt-8 md:mt-10">
            <h1 className="text-center text-3xl font-medium my-5">
              Sản Phẩm Cùng Loại
            </h1>

            <div className="w-9/10 mx-auto">
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={4}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={2000}
              >
                {sliderInitialized &&
                  dataSourceToRender?.map((item) => {
                    // console.log("id",product?.product.categoryId);

                    if (
                      String(item.categoryId) ==
                      String(product?.product?.categoryId)
                    ) {
                      return (
                        <div key={item._id}>
                          <Item product={item} />
                        </div>
                      );
                    }
                  })}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Detail_Product;

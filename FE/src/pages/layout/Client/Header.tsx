// Header.js

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { TiDelete } from "react-icons/ti";
import { BsFillBagCheckFill, BsHeart } from "react-icons/bs";
import { AiFillEye } from "react-icons/ai";
import { useGetInformationsQuery } from "../../../api/information";
import { IInformation } from "../../../interfaces/information";
import UserInformation from "../Users/UserInformation/user";
import { useSearchProductsQuery } from "@/api/product";
import { useAppSelector } from "@/store/hook";

const Header = () => {
  const listMenu = [
    { name: "Trang Chủ", path: "/" },
    { name: "Sản Phẩm", path: "/list-productsAll" },
    { name: "Tin Tức", path: "/blog" },
    { name: "Thông Tin", path: "/about" },
    { name: "Liên Hệ", path: "/contact" },
  ];
  const initialCarts = useAppSelector((state: RootState) => state.cart.cart);
  const [carts, setCarts] = useState(initialCarts);
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const inputRef = useRef(null as any);
  const { data: informationData } = useGetInformationsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults, error, isLoading, refetch } = useSearchProductsQuery(searchTerm);

  useEffect(() => {
    setCarts(initialCarts);
  } , [initialCarts])

  useEffect(() => {
    if (searchTerm) {
      refetch();
    }
  }, [searchTerm, refetch]);

  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();
    setSearchTerm(e.target.value);
  };
  const handleSelectProduct = (productName: string) => {
    setSearchTerm(productName);
    

    // Hide search results here
  };
  const handleClear =
    () => {
      setSearchTerm("");
      inputRef.current.focus();
    };

  return (
    <>
      <div className="fixed z-40 pt-1">
        <header className="min-h-[100px] bg-white w-screen">
          <div className="content-header py-2 flex md:flex-row items-center mx-auto md:mx-10 relative">
            <div className="w-20 h-20 ">
              <Link to={"/"}>
                {informationData?.data?.map((information: IInformation) => (
                  <img alt="" src={information.logo} className="rounded-full" />
                ))}
              </Link>
            </div>
            <div className="navbar-menu-header hidden md:block ">
              <ul className="flex items-center justify-center">
                {listMenu.map((item, index) => (
                  <li className="mx-2" key={index}>
                    <Link
                      className={`px-2 py-1 text-lg font-medium hover:text-teal-500 ${activeLink === item.path
                          ? "text-teal-500 transition-opacity"
                          : ""
                        }`}
                      to={item.path}
                      onClick={() => setActiveLink(item.path)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-80 mx-auto mt-4 md:mt-0">
              <form
                onSubmit={handleSearch}
                className={`search-header relative ml-auto w-50 focus-within:w-80 border h-10 group flex items-center justify-around pl-2 rounded-3xl ${valueSearch.length > 0 ? "w-80" : ""
                  }`}
              >
                <input
                  className="inp-search w-5/6 text-sm caret-teal-400 h-6 outline-none pl-2 pr-7"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  ref={inputRef}
                />
                {searchTerm && (
                  <span
                    onClick={handleClear}
                    className="absolute clears cursor-pointer right-[50px] top-1/2 translate-y-[-50%]"
                  >
                    <TiDelete className="text-xl text-black" />
                  </span>
                )}

                <button className="mx-1">
                  <SearchOutlined />
                </button>
                {searchResults && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      zIndex: 10,
                      width: "100%",
                      backgroundColor: "white",
                      maxHeight: "200px",
                      overflowY: "auto",
                      display: searchTerm ? "block" : "none",
                    }}
                  >
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {searchTerm &&
                      searchResults &&
                      searchResults.products.length > 0 ? (
                        <div>
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {searchResults.products.map((product:any) => (
                              <li
                                key={product._id}
                                style={{ marginBottom: "10px" }}
                              >
                                <Link
                                  to={`/products/${product._id}`}
                                  style={{
                                    color: "black",
                                    textDecoration: "none",
                                  }}
                                  onClick={() =>{
                                    handleSelectProduct(product.name)
                                    // setSearchTerm(product.name)
                                    
                                  }
                                  
                                  }
                                >
                                  {product.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </ul>
                  </div>
                )}
              </form>
              {isLoading && <p>Đang tìm kiếm...</p>}

              {error && 'message' in error && <p>Có lỗi xảy ra: {error.message}</p>}
            </div>
            <div className="action-cart-heart md:flex items-center hidden ">
              <div className="heart-header mx-5">
                <Link title="Cart" className="" to={"/cart"}>
                  <i className="relative">
                    <BsFillBagCheckFill className="heart-icon text-black text-3xl" />
                    <div className="quatity-producst -top-2 ml-6 absolute">
                      <span className="bg-red-500 text-white rounded-full text-xs px-1 py-[2px]">
                        {carts.length}
                      </span>
                    </div>
                  </i>
                </Link>
              </div>
              <div>
                <UserInformation />
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};
export default Header;
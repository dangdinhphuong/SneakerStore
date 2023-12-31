import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const [remainingTime, setRemainingTime] = useState(0);
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    let countdown: number | undefined;

    if (counting) {
      countdown = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(countdown);
          setCounting(false);
        } else {
          setRemainingTime((prevTime) => prevTime - 1);
        }
      }, 1000);
    }

    return () => {
      clearInterval(countdown);
    };
  }, [counting, remainingTime]);

  const handleStartCountdown = () => {
    setRemainingTime(59);
    setCounting(true);
  };

  const handleSubmitEmail = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgotpassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.message === "Mã xác nhận đã được gửi qua email.") {
        message.success(data.message);
        setStep(2);
        handleStartCountdown();
      } else {
        message.error("Có lỗi xảy ra khi gửi email.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi email.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/resendotp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log(data);

      if (data.message === "Mã xác nhận mới đã được gửi qua email.") {
        message.success(data.message);
        handleStartCountdown();
      } else {
        message.error("Có lỗi xảy ra khi gửi lại mã OTP.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi lại mã OTP.");
    }
  };
  const handleSubmitOTP = async () => {
    const handleResendOTP = () => {
      if (!counting) {
        handleStartCountdown();
      }
    };
    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/otpauthentication",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (data.message === "Mã OTP xác nhận thành công.") {
        message.success(data.message);
        setStep(3);
      } else {
        message.error("Mã OTP không hợp lệ.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xác thực OTP.");
    }
  };

  const handleSubmitPassword = async () => {
    if (newPassword === confirmPassword) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/auth/resetpassword`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, newPassword, confirmPassword }),
          }
        );

        const data = await response.json();

        if (data.message === "Mật khẩu đã được đổi thành công.") {
          message.success(data.message);
          setStep(4);
          navigate("/signin")
        } else {
          message.error(
            "Có lỗi xảy ra khi đổi mật khẩu(mật khẩu phải ít nhất có 6 kí tự)"
          );
        }
      } catch (error) {
        message.error("Có lỗi xảy ra khi đổi mật khẩu.");
      }
    } else {
      message.error("Mật khẩu và xác thực mật khẩu không khớp.");
    }
  };

  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.js"
        defer
      ></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js"></script>
      <style>
        @import
        url('https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css')
      </style>
      <div className="min-w-screen min-h-screen bg-white flex items-center justify-center px-5 py-5">
        <div className="bg-gray-100 text-black rounded-3xl shadow-xl w-full overflow-hidden">
          <div className="md:flex w-full">
            <div className="hidden md:block w-1/2 bg-black py-10 px-10 d-flex justify-content-center">
              <img
                src="https://cf.shopee.vn/file/7a691fe13b7eb2771b61a0de923ad312"
                className="rounded-3xl"
                alt=""
              />
            </div>
            <div className="w-full md:w-1/2 py-10 px-5 md:px-10">
              <div className="text-center mb-10">
                <h1 className="font-bold text-3xl text-gray-900 mb-5">
                  Quên mật khẩu
                </h1>
              </div>
              <div className="mx-auto max-w-xs">
                {step === 1 && (
                  <div>
                    <p className="text-center ">
                      Nhập Email để lấy mã xác thực
                    </p>
                    <label htmlFor="" className="text-xs font-semibold px-1">
                      Email
                    </label>
                    <div className="flex mt-3 mb-3">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-email-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus-border-indigo-500"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitEmail}
                      className="mt-5 tracking-wide font-semibold bg-slate-900 text-white w-full py-4 rounded-lg hover-bg-white hover-text-black transition-all duration-300 ease-in-out flex items-center justify-center focus-shadow-outline focus-outline-none"
                    >
                      Gửi OTP
                    </button>
                    <div className="flex -mx-3 mt-5">
                      <div className="w-full px-3 mb-5 text-center text-black hover:text-blue-400">
                        <Link to="/signin">Quay về trang đăng nhập ?</Link>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="text-center ">Nhập mã OTP để xác thực</p>
                    <label htmlFor="" className="text-xs font-semibold px-1">
                      Nhập mã OTP
                    </label>
                    <div className="flex mt-3 mb-3">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-cellphone-iphone text-gray-400 text-lg"></i>
                      </div>
                      <input
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus-border-indigo-500"
                        type="text"
                        placeholder="Mã OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitOTP}
                      className="mt-5 tracking-wide font-semibold bg-slate-900 text-white w-full py-4 rounded-lg hover-bg-white hover-text-black transition-all duration-300 ease-in-out flex items-center justify-center focus-shadow-outline focus-outline-none"
                    >
                      Xác nhận OTP
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className={`mt-3 tracking-wide font-semibold bg-white text-black text-center py-2 px-4 rounded hover-text-white transition-all duration-300 ease-in-out focus:outline-none ${
                        counting ? "opacity-50 pointer-events-none" : ""
                      }`}
                      disabled={counting}
                    >
                      {counting
                        ? `Gửi lại mã OTP (${remainingTime}s)`
                        : "Gửi lại mã OTP"}
                    </button>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <p className="text-center ">Nhập mật khẩu mới</p>
                    <label htmlFor="" className="text-xs font-semibold px-1">
                      Nhập mật khẩu mới
                    </label>
                    <div className="flex mt-3 mb-3">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-lock-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus-border-indigo-500"
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <label htmlFor="" className="text-xs font-semibold px-1">
                      Xác nhận lại mật khẩu
                    </label>
                    <div className="flex mt-3 mb-3">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-lock-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus-border-indigo-500"
                        type="password"
                        placeholder="Xác thực mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitPassword}
                      className="mt-5 tracking-wide font-semibold bg-slate-900 text-white w-full py-4 rounded-lg hover-bg-white hover-text-black transition-all duration-300 ease-in-out flex items-center justify-center focus-shadow-outline focus-outline-none"
                    >
                      Đặt lại mật khẩu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;

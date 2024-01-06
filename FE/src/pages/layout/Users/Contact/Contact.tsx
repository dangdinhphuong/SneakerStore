import { Button, Form, Input, message } from "antd";
import { useAddContactMutation } from "../../../../api/contact";
import { IContact } from "../../../../interfaces/contact";
import { useNavigate } from "react-router-dom";
import LoadingOutlined from "@ant-design/icons";
import { FiMapPin, FiUser } from 'react-icons/fi';
import { TfiEmail } from 'react-icons/tfi';
import { FaPhone } from 'react-icons/fa';
import { SlEarphones } from 'react-icons/sl';
import { useGetInformationsQuery } from "@/api/information";
import { IInformation } from "@/interfaces/information";
type FieldType = {
    firstName: string,
    email: string,
    phone: number,
    content: string,
};
const Contact = () => {
    const { data: informationData } = useGetInformationsQuery();
    const [addContact] = useAddContactMutation();
    const navigate = useNavigate();

    const onFinish = async (values: IContact) => {
        console.log("Form Values:", values);

        try {
            await addContact(values).unwrap();
            message.success("Gửi liên hệ thành công");
            navigate("");
        } catch (error) {
            message.error("Có lỗi xảy ra khi gửi liên hệ");
            console.error(error);
        }
    };

    return (
        <>
            <div className='img mt-10'>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14895.092641094374!2d105.74612438914794!3d21.041760553526792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1sen!2s!4v1703237098908!5m2!1sen!2s"
              width="1470"
              height="300"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              style={{ border: '2px solid #ddd', borderRadius: '30px 0px' }} // Add border styles here
            ></iframe>
          </div>
          
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Thông tin */}
                {informationData?.data?.map((information: IInformation) => (
                    <div className="bg-white rounded-lg p-8 flex flex-col w-full shadow-md">
                        <h2 className="text-gray-900 text-lg mb-4 font-medium title-font">
                            Thông tin
                        </h2>

                        {/* Địa chỉ */}
                        <div className="mb-4 border p-4 flex items-center rounded-2xl">
                            <div className='icon mr-4'>
                                <FiMapPin />
                            </div>
                            <div className='text'>
                                <h4>Địa chỉ</h4>
                                <p> {information.address}</p>
                            </div>
                        </div>
                        {/* Thông tin khách hàng */}
                        <div className="border p-4 rounded-2xl flex items-center">
                            <div className='icon mr-4'>
                                <SlEarphones />
                            </div>
                            <div className='text'>
                                <h4>Chăm sóc khách hàng</h4>
                                <p>Email: {information.email}<br></br>
                                    Hotline: {information.phone}
                                    Thứ Hai đến Thứ Bảy, từ 8:00 đến 17:30 và mọi lúc</p>
                            </div>
                        </div>

                        <div className="border p-4 rounded-2xl flex items-center mt-10">
                            <div className='icon mr-4'>
                                <SlEarphones />
                            </div>
                            <div className='text'>

                                <p>  Chúng tôi ở đây để giúp đỡ và trả lời bất kỳ câu hỏi nào bạn có thể
                                    có. Hãy cho chúng tôi biết về vấn đề của bạn để chúng tôi có thể giúp bạn nhiều hơn
                                    nhanh. Chúng tôi mong nhận được phản hồi từ bạn.</p>
                            </div>
                        </div>
                    </div>
                ))}




                {/* Form */}
                <div className="bg-white rounded-lg p-8 flex flex-col w-full shadow-md">
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        className="mt-30"

                    >
                        <div className="bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
                            Email đến SneakerStore
                            {/* Form.Item cho trường Tên */}
                            <Form.Item<FieldType>
                                label="Họ và Tên"
                                name="firstName"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên !" },
                                ]}
                                hasFeedback
                                className="relative left-[29px]"
                            >
                                <Input className="relative top-[14px] left-[-74px] w-[350px] mb-4 mt-3" />
                            </Form.Item>

                            {/* Form.Item cho trường Email */}
                            <Form.Item<FieldType> label="Email" name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email !" },
                                    { type: "email", message: "email không đúng định dạng" }
                                ]}
                                hasFeedback
                                className="relative left-[49px]"
                            >
                                <Input className="relative top-[14px] left-[-65px] w-[350px] mb-4 mt-3" />
                            </Form.Item>

                            {/* Form.Item cho trường Số điện thoại*/}
                            <Form.Item<FieldType>
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại !" },
                                    { min: 10, message: "Sản phẩm ít nhất 10 ký tự" },

                                ]}
                                hasFeedback
                                className="relative left-[50px]"
                            >
                                <Input className="relative top-[15px] left-[-114px] w-[350px] mb-4 mt-3" />
                            </Form.Item>

                            {/* Form.Item cho trường Nội dung */}
                            <Form.Item
                                label="Nội dung"
                                name="content"
                                rules={[
                                    { required: true, message: "Vui lòng nhập nội dung" },
                                ]}
                                hasFeedback
                                className="relative left-[50px]"
                            >
                                <Input.TextArea
                                    className="relative top-[15px] left-[-90px] w-[350px] mb-4 mt-3 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                                />
                            </Form.Item>

                            {/* Nút Gửi */}
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="text-white bg-indigo-500 border-0 pb-8 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
                            >
                                Gửi
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </>

    );
};

export default Contact;

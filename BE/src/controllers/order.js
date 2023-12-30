import mongoose from "mongoose";
import Orders from "../models/orders.js";
import Product from "../models/product";
import {productSchema, UpdateProduct} from "../Schema/product";
import * as functions from "../service/functions.js";
// đặt hàng
    export const OrderUser = async (req, res, next) => {
        try {
            let { address, phone, id_user, id_product } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!address) return functions.setError(res, "Vui lòng nhập vào địa chỉ", 400);
            if (!phone) return functions.setError(res, "Vui lòng nhập vào số điện thoại", 400);
            if (!id_user) return functions.setError(res, "Vui lòng nhập vào id người mua", 400);
            if (!id_product) return functions.setError(res, "Vui lòng nhập vào id sản phẩm", 400);

            // Kiểm tra dữ liệu đầu vào có hợp lệ không
            if (id_user && id_product && phone && address) {
                // Tìm ID lớn nhất hiện tại để tạo ID mới cho đơn hàng
                let checkId = await Orders.findOne({}, { id_order: 1 }).sort({ id_order: -1 }).lean();
                let id_order = checkId ? checkId.id_order + 1 : 1;

                console.log('Creating Order with ID:', id_order);

                // Tạo đơn hàng
                await Orders.create({
                    id_order,
                    address,
                    phone,
                    user_id: id_user,
                    products: [], // Bạn cần cung cấp một mảng products hợp lệ
                    status: "pending",
                    total_price: 0, // Bạn cần cung cấp một giá trị total_price hợp lệ
                    sale_id: null, // Bạn cần cung cấp một giá trị sale_id hợp lệ
                });

                return functions.success(res, `Đặt hàng thành công với id_order: ${id_order}`);
            }
        } catch (error) {
            console.error('Error in OrderUser:', error);
            return functions.setError(res, error.message);
        }
    };

// get order
    export const getAll = async (req, res) => {
        const {page = 1, limit = 10, sort = "createdAt", order = -1, ...query} = req.query;
        const skip = (page - 1) * limit;
        const sortOptions = {
            [sort]: order === 1 ? 1 : -1,
        };
        const condition = req.query.user_id ? {user_id: new mongoose.Types.ObjectId(req.query.user_id)} : query;

        const orders = await Orders.aggregate([
            {$match: condition},
            {
                $unwind: "$products",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $lookup: {
                    from: "payment",
                    localField: "payment_id",
                    foreignField: "_id",
                    as: "payment",
                },
            },
            {
                $unwind: {
                    path: "$payment",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: {
                        _id: "$_id",
                        user_id: "$user_id",
                        address: "$address",
                        status: "$status",
                        payment: "$payment",
                        total_price: "$total_price",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    },
                    products: {
                        $push: {product: "$product", quantity: "$quantity"},
                    },
                },
            },
            {
                $project: {
                    user_id: 1,
                    status: 1,
                    total_price: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    payment: 1,
                    product: {$arrayElemAt: ["$product", 0]},
                    quantity: "$products.quantity",
                },
            },
            {
                $project: {
                    _id: "$_id",
                    user_id: "$_id.user_id",
                    address: "$_id.address",
                    status: "$_id.status",
                    total_price: "$_id.total_price",
                    payment: "$_id.payment",
                    createdAt: "$_id.createdAt",
                    updatedAt: "$_id.updatedAt",
                    products: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        return res.status(200).json({
            message: "Get all order successfully",
            data: orders,
        });
    };

    export const updateStatus = async (req, res, next) => {
        try {
            const posts = await Orders.findByIdAndUpdate(req.params.id, req.body, {new: true});

            return res.status(200).json({
                message: "Update order successfully",
                data: posts,
            });
        } catch (error) {
            res.status(500).json({error: true, message: error.message});
        }
    };

// Create order
    export const createOrder = async (req, res) => {
        try {
            const newOrder = new Orders(req.body);
            for (const product of newOrder.products) {
                const {product_id, color, size, quantity} = product;

                // Kiểm tra product_id
                const existingProduct = await Product.findById(product_id);

                if (!existingProduct) {
                    return res.status(404).json({
                        error: true,
                        message: `Product with ID ${product_id} not found`,
                    });
                }

                // Kiểm tra logic xử lý số lượng còn lại tại đây nếu cần
                const quantityInfoIndex = existingProduct.listQuantityRemain.findIndex(
                    (item) => item.colorHex === color && item.nameSize === size
                );

                if (quantityInfoIndex === -1 || existingProduct.listQuantityRemain[quantityInfoIndex].quantity < quantity) {
                    return res.status(400).json({
                        error: true,
                        message: `Insufficient quantity for product ${product_id} with color ${color} and size ${size}`,
                    });
                }

                // Cập nhật số lượng còn lại
                existingProduct.listQuantityRemain[quantityInfoIndex].quantity -= quantity;

                // Tạo một bản sao của listQuantityRemain để cập nhật mảng
                const updatedListQuantityRemain = [...existingProduct.listQuantityRemain];
                updatedListQuantityRemain[quantityInfoIndex] = {
                    ...updatedListQuantityRemain[quantityInfoIndex],
                    quantity: existingProduct.listQuantityRemain[quantityInfoIndex].quantity,
                };

                // Cập nhật lại listQuantityRemain trong existingProduct
                await Product.findByIdAndUpdate(
                    product_id,
                    {$set: {listQuantityRemain: updatedListQuantityRemain}},
                    {new: true}
                );

                // Các kiểm tra khác nếu cần
                // ...
            }

            const order = await newOrder.save();

            return res.status(200).json({
                message: "Create order successfully",
                data: order._id,
            });
        } catch (error) {
            res.status(500).json({error: true, message: error.message});
        }
    };

// chi tiết đơn hàng
    export const GetDetailOrder = async (req, res, next) => {
        try {
            let id = Number(req.query.id);
            let data = await Orders.findOne({id_order: id}).lean();
            return functions.success(res, "get data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };
    export const GetAllOrder = async (req, res, next) => {
        try {
            let data = await Orders.find({});
            return functions.success(res, "get data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };

    export const deleteOrder = async (req, res, next) => {
        try {
            const {_id} = req.query;
            let data = await Orders.deleteOne({_id});
            return functions.success(res, "delete data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };

    export const updateOrder = async (req, res, next) => {
        try {
            const {_id, address, phone, status} = req.query;
            var dd = {};
            if (address != "") dd = {...dd, ...{address}};
            if (phone != "") dd = {...dd, ...{phone}};
            if (status != "") dd = {...dd, ...{status}};

            console.log(req.query);
            let data = await Orders.updateOne({_id}, {$set: dd});
            return functions.success(res, "update data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };

export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id; // Giả sử ID đơn hàng được truyền qua đường dẫn

        // Sử dụng Mongoose để truy vấn đơn hàng theo ID và điền thông tin sản phẩm
        const order = await Orders.findById(orderId).populate({
            path: 'products.product',
            model: 'Product',
        });

        if (!order) {
            return res.status(404).json({
                error: true,
                message: `Order with ID ${orderId} not found`,
            });
        }

        // Trả về kết quả
        return res.status(200).json(order);
    } catch (error) {
        console.error('Error in getOrderById:', error);
        return res.status(500).json({ error: true, message: error.message });
    }
};

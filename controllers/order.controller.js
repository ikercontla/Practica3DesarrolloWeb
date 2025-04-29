const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, items } = req.body;
        const userId = req.user.userId; // Obtener el userId del token JWT

        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let subtotal = 0;

        // Procesar los productos y calcular subtotal
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product with ID ${item.product} not found`);

            const totalPrice = product.price * item.quantity;
            subtotal += totalPrice;

            return {
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            };
        }));

        // Calcular impuestos y total
        const tax = subtotal * 0.16; // 16% de impuestos
        const total = subtotal + tax;

        // Crear la orden
        const order = new Order({
            user: userId, // Asociar la orden al usuario autenticado
            shippingAddress,
            items: orderItems,
            subtotal,
            tax,
            total
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ user: userId }).populate('user', 'name email').populate('items.product', 'description price');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const order = await Order.findById( {_id: req.params.id, user: userId }).populate('user', 'name email').populate('items.product', 'description price');
        if (!order) return res.status(404).json({ message: 'Order no found.' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




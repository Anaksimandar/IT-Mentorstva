const { findItemById, findCartItems } = require("../repository/product.repository");
const { insertItemToCart, deleteItemFromCart } = require("../repository/session.repository");
const { insertOrder } = require("../repository/order.repository");
const { getItemById } = require("../repository/product.repository");

const getQuantityInCart = (session, itemId) => {
  const cartItem = Array.isArray(session.shoppingCart)
    ? session.shoppingCart.find((entry) => entry.itemId === itemId)
    : undefined;
  return Number(cartItem?.quantity ?? 0);
};

const addItemToCart = async (session, itemId) => {
  if (!itemId || typeof itemId !== "string") {
    throw new Error("Invalid item_id");
  }

  const actualItem = await findItemById(itemId);
  if (!actualItem) {
    throw new Error("Item not found");
  }

  const quantityInCart = getQuantityInCart(session, itemId);
  if (actualItem.stock <= quantityInCart) {
    throw new Error("Item is out of stock");
  }

  const succesfullyAdded = await insertItemToCart(session.sessionId, itemId);
  if (!succesfullyAdded) {
    throw new Error("Could not add item to cart");
  }
  return { message: "Item added to cart" };
};

const removeItemFromCart = (session, itemId) => {
  if (!itemId || typeof itemId !== "string") {
    throw new Error("Invalid item_id");
  }
  const quantityInCart = getQuantityInCart(session, itemId);
  if (quantityInCart === 0) {
    throw new Error("Item not in cart");
  }

  const succesfullyRemoved = deleteItemFromCart(session.sessionId, itemId);
  if (!succesfullyRemoved) {
    throw new Error("Could not remove item from cart");
  }
  return { message: "Item removed from cart" };
};

const createOrder = async (session, orderData) => {
  const cartItems = await findCartItems(session.shoppingCart || []);
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  orderData.userId = session.userId;
  orderData.items = cartItems;
  orderData.total = total;

  const orderResult = await insertOrder(orderData);
  if (!orderResult) {
    throw new Error("Could not create order");
  }
  return { message: "Order created successfully", orderId: orderResult.orderId };
};

module.exports = { addItemToCart, removeItemFromCart, createOrder };

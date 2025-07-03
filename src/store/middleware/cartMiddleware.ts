import { Middleware } from "@reduxjs/toolkit";
import { addItem, clearCart, removeItem, decreaseQuantity, increaseQuantity, updateItem } from "../slices/cartSlice";
import { POST } from "../../api";
import { debounce } from "lodash";
import { cartApi, useAddToCartMutation } from "../../api/cartApi";
const createSyncCartWithServer = () => {
  return debounce(async (store) => {
    const items = JSON.parse(JSON.stringify(store.getState().cart.items));
    const orderType = store.getState().user.orderType;

    await store.dispatch(
      cartApi.endpoints.addToCart.initiate({
        items,
        order_type: orderType
      })
    );
    // await POST({
    //   endpoint: `/cart?branch=ashrafieh`,
    //   formData: { items, order_type: orderType }
    // });
    // console.log('Cart synced with server');

  }, 800);
};


const cartMiddleware: Middleware = store => next => async action => {
  const syncCartWithServer = createSyncCartWithServer();

  const result = next(action);

  if (
    addItem.match(action) ||
    updateItem.match(action) ||
    clearCart.match(action) ||
    increaseQuantity.match(action) ||
    decreaseQuantity.match(action) ||
    removeItem.match(action)
  ) {
    syncCartWithServer(store);
  }

  return result;

};

export default cartMiddleware;


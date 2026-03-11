import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Returns the total quantity of a given item in the cart.
 * An item can appear multiple times in the cart (with different modifiers),
 * so we sum all quantities for matching items_id.
 */
export const useCartItemCount = (itemId: number): number => {
  const cartItems = useSelector((state: RootState) => state.cart.items);

  return useMemo(() => {
    let count = 0;
    for (const key in cartItems) {
      if (cartItems[key].id === itemId) {
        count += cartItems[key].quantity;
      }
    }
    return count;
  }, [cartItems, itemId]);
};

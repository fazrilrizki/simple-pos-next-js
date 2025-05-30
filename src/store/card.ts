import { create } from 'zustand'

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

//Omit maksudnya jangan include property quantity
type AddToCartItem = Omit<CartItem, "quantity">

interface CartState {
  items: CartItem[];
  addToCart: (newItem: AddToCartItem) => void;
}

export const useCartStore = create<CartState>()((set) => ({
    items: [],
    addToCart: (newItem) => {
       set((currentState) => {
        const duplicateItems = [...currentState.items];

        const existingItemIndex = duplicateItems.findIndex(item => item.productId === newItem.productId);

        if (existingItemIndex === -1) {
            duplicateItems.push({
                productId: newItem.productId,
                name: newItem.name,
                imageUrl: newItem.imageUrl,
                price: newItem.price,
                quantity: 1
            })
        } else {

            const itemToUpdate = duplicateItems[existingItemIndex];

            if (!itemToUpdate) return {
                ...currentState
            }

            itemToUpdate.quantity += 1;
        }


        return {
            ...currentState,
            items: duplicateItems
        }
       })
    }
}))

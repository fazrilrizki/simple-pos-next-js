import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createQRIS, xenditPaymentMethodClient, xenditPaymentRequestClient } from "@/server/xendit";
import { addMinutes } from "date-fns";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
    createOrder: protectedProcedure.input(
        z.object({
            orderItems: z.array(z.object({
                productId: z.string(),
                quantity: z.number().min(1)
            }))
        })        
    ).mutation(async ({ ctx, input}) => {
        const { db } = ctx;
        const { orderItems } = input;

        //Data real/update dari db, dari product yang kita add to cart
        const products = await db.product.findMany({
            where: {
                id: {
                    in: orderItems.map(item => item.productId),
                }
            }
        });

        let subtotal = 0;

        products.forEach(product => {
            const productQuantity = orderItems.find(item => item.productId === product.id)!.quantity;

            const totalPrice = product.price * productQuantity;

            subtotal += totalPrice;
        })

        const tax = subtotal * 0.1;
        const grandtotal = subtotal + tax;
        
        const order = await db.order.create({
            data: {
                grandtotal,
                subtotal,
                tax,
            }
        })

        const newOrderItems = await db.orderItem.createMany({
            data: products.map(product => {
                const productQuantity = orderItems.find((item) => item.productId === product.id)!.quantity;

                return {
                    orderId: order.id,
                    price: product.price,
                    productId: product.id,
                    quantity: productQuantity
                }
            })
        })

        const paymentRequest = await createQRIS({
            amount: grandtotal,
            orderId: order.id,
        })

        await db.order.update({
            where: {
                id: order.id,
            },
            data: {
                externalTransactionId: paymentRequest.id,
                paymentMethodId: paymentRequest.paymentMethod.id,
                
            }
        })

        return {
            order,
            newOrderItems,
            qrString: paymentRequest.paymentMethod.qrCode!.channelProperties!.qrString!,
        }
    }),

    simulatePayment: protectedProcedure.input(
        z.object({
            orderId: z.string().uuid()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx;

        const order = await db.order.findUnique({
            where: {
                id: input.orderId
            },
            select: {
                paymentMethodId: true,
                grandtotal: true,
                externalTransactionId: true
            }
        })

        if (!order) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Order not found"
            })
        }

        await xenditPaymentMethodClient.simulatePayment({
            paymentMethodId: order.paymentMethodId!,
            data: {
                amount: order.grandtotal
            }
        })
    })
})
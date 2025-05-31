import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { OrderCard, type Order } from "@/components/OrderCard";
import type { NextPageWithLayout } from "../_app";
import type { ReactElement } from "react";
import { useState } from "react";
import { api } from "@/utils/api";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Select } from "@/components/ui/select";
import { OrderStatus } from "@prisma/client";
import { toRupiah } from "@/utils/toRupiah";

const SalesPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [filterOrder, setFilterOrder] = useState<OrderStatus | "ALL">("ALL");
  
  const { data: orders } = api.order.getOrder.useQuery({
    status: filterOrder
  });

  const {data: salesReport} = api.order.getSalesReport.useQuery();

  const { mutate: finihsOrder, isPending: finishOrderIsPending, variables: finishOrderVariables } = api.order.finisOrder.useMutation({
    onSuccess: async () => {
      await apiUtils.order.getOrder.invalidate();
      alert("Finished Order")
    }
  })

  const handleFinishOrder = (orderId: string) => {
    finihsOrder({
      orderId
    })
  };

  const handleFilterOrderChange = (value: OrderStatus | "ALL") => {
    setFilterOrder(value)
  }

  return (
    <>
      <DashboardHeader>
        <DashboardTitle>Sales Dashboard</DashboardTitle>
        <DashboardDescription>
          Track your sales performance and view analytics.
        </DashboardDescription>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">{toRupiah(salesReport?.totalRevenue ?? 0)}</p>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Ongoing Orders</h3>
          <p className="mt-2 text-3xl font-bold">{salesReport?.totalOngoingOrder ?? 0}</p>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-medium">Completed Orders</h3>
          <p className="mt-2 text-3xl font-bold">{salesReport?.totalCompletedOrders ?? 0}</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium mb-4">Orders</h3>
          
          <Select>
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>

            <SelectContent align="end">
              <SelectItem value="ALL">ALL</SelectItem>
              {
                Object.keys(OrderStatus).map((orderStatusKey) => (
                  <SelectItem key={orderStatusKey} value={orderStatusKey}>
                    {OrderStatus[orderStatusKey]}
                  </SelectItem>
                ))
              }
            </SelectContent>

          </Select>
          
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders?.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              status={order.status}
              totalAmount={order.grandtotal}
              totalItems={1}
              onFinishOrder={handleFinishOrder}
              isFinishOrder={finishOrderIsPending && order === finishOrderVariables}
            />
          ))}
        </div>
      </div>
    </>
  );
};

SalesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SalesPage; 
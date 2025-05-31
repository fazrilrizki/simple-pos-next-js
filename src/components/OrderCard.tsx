import { Button } from "@/components/ui/button";
import { toRupiah } from "@/utils/toRupiah";
import { OrderStatus } from "@prisma/client";

interface OrderCardProps {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus
  onFinishOrder?: (orderId: string) => void;
  isFinishOrder?: () => boolean;
}

export const OrderCard = ({ id, status, totalAmount, totalItems, onFinishOrder, isFinishOrder }: OrderCardProps) => {
  const handleFinishOrder = () => {
    if (onFinishOrder) {
      onFinishOrder(id);
    }
  };

  const getBadgeColor = () => {
    switch(status) {
      case OrderStatus.AWAITING_PAYMENT:
        return "bg-yellow-100 text-yellow-800"
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800"
      case OrderStatus.DONE:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm bg-card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Order ID</h4>
          <p className="font-mono text-sm">{id}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
          {status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Total Amount</h4>
          <p className="text-lg font-bold">{toRupiah(totalAmount)}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Total Items</h4>
          <p className="text-lg font-bold">{totalItems}</p>
        </div>
      </div>

      {status === OrderStatus.PROCESSING && (
        <Button 
          onClick={() =>  {

            if (onFinishOrder) { onFinishOrder(id) }}
          }
          className="w-full"
          size="sm"
        >
          Finish Order
        </Button>
      )}
    </div>
  );
}; 
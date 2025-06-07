"use client";

import { useState } from "react";
import { Order } from "@/lib/types/order";
import { OrderFilters } from "./order-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filteredStatus === "all" || order.orderStatus === filteredStatus;
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.purchaserEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order["orderStatus"]) => {
    const statusConfig = {
      held: { label: "保留中", variant: "outline" as const },
      expired: { label: "已過期", variant: "secondary" as const },
      paid: { label: "已付款", variant: "default" as const },
      cancelled: { label: "已取消", variant: "destructive" as const },
      refunded: { label: "已退款", variant: "outline" as const },
    };

    return (
      <Badge variant={statusConfig[status].variant}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const calculateTotalAmount = (order: Order) => {
    // 如果有票價資訊，計算總金額
    if (order.ticketType?.ticketTypePrice) {
      return `NT$ ${order.ticketType.ticketTypePrice}`;
    }
    return "-";
  };

  return (
    <div className="space-y-4">
      <OrderFilters
        onStatusChange={setFilteredStatus}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單編號</TableHead>
              <TableHead>購買人</TableHead>
              <TableHead>票券類型</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  沒有找到訂單
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-mono text-sm">
                    {order.orderId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.purchaserName || order.user?.name || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.purchaserEmail || order.user?.email || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.ticketType?.ticketTypeName || "-"}
                  </TableCell>
                  <TableCell>
                    {calculateTotalAmount(order)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.orderStatus)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "yyyy/MM/dd HH:mm", {
                      locale: zhTW,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 訂單詳情對話框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
            <DialogDescription>
              訂單編號：{selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">購買人資訊</h4>
                  <div className="space-y-1 text-sm">
                    <p>姓名：{selectedOrder.purchaserName || selectedOrder.user?.name || "-"}</p>
                    <p>信箱：{selectedOrder.purchaserEmail || selectedOrder.user?.email || "-"}</p>
                    <p>電話：{selectedOrder.purchaserPhone || selectedOrder.user?.phone || "-"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">訂單資訊</h4>
                  <div className="space-y-1 text-sm">
                    <p>狀態：{getStatusBadge(selectedOrder.orderStatus)}</p>
                    <p>建立時間：{format(new Date(selectedOrder.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })}</p>
                    {selectedOrder.updatedAt && (
                      <p>更新時間：{format(new Date(selectedOrder.updatedAt), "yyyy/MM/dd HH:mm", { locale: zhTW })}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedOrder.ticketType && (
                <div>
                  <h4 className="font-medium mb-2">票券資訊</h4>
                  <div className="space-y-1 text-sm">
                    <p>票券類型：{selectedOrder.ticketType.ticketTypeName}</p>
                    <p>票價：NT$ {selectedOrder.ticketType.ticketTypePrice}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">發票資訊</h4>
                <div className="space-y-1 text-sm">
                  <p>發票類型：{selectedOrder.invoiceType || "-"}</p>
                  <p>載具：{selectedOrder.invoiceCarrier || "-"}</p>
                  <p>發票號碼：{selectedOrder.invoiceNumber || "-"}</p>
                  <p>發票狀態：{selectedOrder.invoiceStatus || "-"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">其他資訊</h4>
                <div className="space-y-1 text-sm">
                  <p>付款方式：{selectedOrder.choosePayment || "-"}</p>
                  <p>鎖定狀態：{selectedOrder.isLocked ? "已鎖定" : "未鎖定"}</p>
                  <p>鎖定到期：{format(new Date(selectedOrder.lockExpireTime), "yyyy/MM/dd HH:mm", { locale: zhTW })}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
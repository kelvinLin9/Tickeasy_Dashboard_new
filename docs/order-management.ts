// app/(dashboard)/dashboard/orders/page.tsx
import { createClient } from "@/lib/supabase/server";
import { OrderTable } from "@/components/orders/order-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { 
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();
  
  // 獲取訂單數據，包含關聯的用戶和票券資訊
  const { data: orders, error } = await supabase
    .from("order")
    .select(`
      *,
      user:userId (
        userId,
        name,
        email,
        phone
      ),
      ticketType:ticketTypeId (
        ticketTypeId,
        ticketTypeName,
        ticketTypePrice,
        concertSessionId
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // 計算訂單統計
  const stats = {
    total: orders?.length || 0,
    held: 0,
    expired: 0,
    paid: 0,
    cancelled: 0,
    refunded: 0,
  };

  orders?.forEach((order) => {
    if (order.orderStatus in stats) {
      stats[order.orderStatus as keyof typeof stats]++;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">訂單管理</h1>
        <p className="text-muted-foreground">
          查看和管理所有訂單記錄
        </p>
      </div>

      {/* 訂單統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="總訂單數"
          value={stats.total}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          title="保留中"
          value={stats.held}
          icon={<Clock className="h-4 w-4" />}
          className={stats.held > 0 ? "border-yellow-200" : ""}
        />
        <StatsCard
          title="已過期"
          value={stats.expired}
          icon={<AlertCircle className="h-4 w-4" />}
          className={stats.expired > 0 ? "border-orange-200" : ""}
        />
        <StatsCard
          title="已付款"
          value={stats.paid}
          icon={<CheckCircle className="h-4 w-4" />}
          className="border-green-200"
        />
        <StatsCard
          title="已取消"
          value={stats.cancelled}
          icon={<XCircle className="h-4 w-4" />}
          className={stats.cancelled > 0 ? "border-red-200" : ""}
        />
        <StatsCard
          title="已退款"
          value={stats.refunded}
          icon={<RefreshCw className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂單列表</CardTitle>
          <CardDescription>
            查看所有訂單詳情
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable orders={orders || []} />
        </CardContent>
      </Card>
    </div>
  );
}

// components/orders/order-table.tsx
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

// components/orders/order-filters.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

export function OrderFilters({ onStatusChange, onSearchChange }: OrderFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="搜尋訂單編號、購買人..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select defaultValue="all" onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="選擇狀態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部狀態</SelectItem>
          <SelectItem value="held">保留中</SelectItem>
          <SelectItem value="expired">已過期</SelectItem>
          <SelectItem value="paid">已付款</SelectItem>
          <SelectItem value="cancelled">已取消</SelectItem>
          <SelectItem value="refunded">已退款</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// components/ui/table.tsx (需要添加這個組件)
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
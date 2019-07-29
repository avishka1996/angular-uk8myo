export interface PurchaseOrder{
   poNo: string;
   deliveryDock: string;
   dcNo: string;
   vendorNo: string;
   fcastQty: string;
   deliveryTime: string;
}
export interface PurchaseOrders{
   purchaseorders: Array<PurchaseOrder>
}
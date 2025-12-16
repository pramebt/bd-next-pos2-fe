// Sale POS Page
"use client";

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/lib/config';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Edit, 
  Printer, 
  X,
  Check,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Food, SaleTemp, SaleTempDetail, SaleTempInfo, Taste, FoodSize, ApiResponse, PayType } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

const SaleTempPage = () => {
  const [table, setTable] = useState(1);
  const [foods, setFoods] = useState<Food[]>([]);
  const [saleTemps, setSaleTemps] = useState<SaleTemp[]>([]);
  const [tastes, setTastes] = useState<Taste[]>([]);
  const [sizes, setSizes] = useState<FoodSize[]>([]);
  const [amount, setAmount] = useState(0);
  const [amountAdded, setAmountAdded] = useState(0);
  const [saleTempDetails, setSaleTempDetails] = useState<SaleTempDetail[]>([]);
  const [saleTempId, setSaleTempId] = useState(0);
  const [payType, setPayType] = useState<PayType>("cash");
  const [inputMoney, setInputMoney] = useState(0);
  const [billUrl, setBillUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasteLoadingId, setTasteLoadingId] = useState<number | null>(null);
  const [deleteSaleTempId, setDeleteSaleTempId] = useState<number | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showEndSaleDialog, setShowEndSaleDialog] = useState(false);
 

  useEffect(() => {
    getFoods();
    fetchDataSaleTemp();
  }, []);

  const openModalEdit = (item: SaleTemp) => {
    setSaleTempId(item.id);
    setIsModalOpen(true);
    fetchDataSaleTempInfo(item.id);
  };

  const fetchDataSaleTempInfo = async (saleTempId: number) => {
    try {
      const res = await axiosInstance.get<{ results: SaleTempInfo }>(
        `/api/sale-temp/info/${saleTempId}`
      );
      setSaleTempDetails(res.data.results.SaleTempDetails || []);
      setTastes(res.data.results.Food?.FoodType?.Tastes || []);
      setSizes(res.data.results.Food?.FoodType?.FoodSizes || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const sumMoneyAdded = (saleTempDetails: SaleTempDetail[]) => {
    let sum = 0;

    for (let i = 0; i < saleTempDetails.length; i++) {
      const detail = saleTempDetails[i];
      sum += detail.FoodSize?.moneyAdded ?? 0;
    }

    return sum;
  };

  const generateSaleTempDetail = async (saleTempId: number) => {
    try {
      const payload = {
        saleTempId: saleTempId,
      };
      await axiosInstance.post(
        '/api/sale-temp/create-sale-temp-detail',
        payload
      );
      await fetchDataSaleTemp();
      fetchDataSaleTempInfo(saleTempId);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const sumAmount = (saleTemps: SaleTemp[]) => {
    let total = 0;
    saleTemps.forEach((item) => (total += item.Food.price * item.qty));

    setAmount(total);
  };

  const getFoods = async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<Food[]>>('/api/food/list');
      setFoods(res.data.result || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const filterFoods = async (foodType: string) => {
    try {
      if (foodType === "all") {
        await getFoods();
      } else {
      const res = await axiosInstance.get<ApiResponse<Food[]>>(
          `/api/food/filter/${foodType}`
      );
        setFoods(res.data.result || []);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const sale = async (foodId: number) => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
        foodId: foodId,
      };
      await axiosInstance.post('/api/sale-temp/create', payload);
      fetchDataSaleTemp();
      toast.success("เพิ่มรายการสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const fetchDataSaleTemp = async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<SaleTemp[]>>('/api/sale-temp/list');
      const results = res.data.result || [];
      setSaleTemps(results);
      sumAmount(results);

      let sum = 0;
      results.forEach((item) => {
        sum += sumMoneyAdded(item.SaleTempDetails || []);
      });

      sumAmount(results);
      setAmountAdded(sum);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const removeSaleTemp = async () => {
    if (!deleteSaleTempId) return;
    
    try {
      await axiosInstance.post(`/api/sale-temp/remove/${deleteSaleTempId}`);
        fetchDataSaleTemp();
      toast.success("ลบรายการสำเร็จ");
      setDeleteSaleTempId(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const removeAllSaleTemp = async () => {
    try {
        const payload = {
          tableNo: table,
          userId: Number(localStorage.getItem("next_user_id")),
        };
      await axiosInstance.delete('/api/sale-temp/remove-all', {
          data: payload,
        });
        fetchDataSaleTemp();
      toast.success("ลบรายการทั้งหมดสำเร็จ");
      setShowDeleteAllDialog(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const updateQty = async (id: number, qty: number) => {
    try {
      const payload = {
        qty: qty,
        id: id,
      };
      await axiosInstance.delete('/api/sale-temp/update-qty', { data: payload });
      fetchDataSaleTemp();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const selectTaste = async (
    tasteId: number,
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      setTasteLoadingId(saleTempDetailId);
      const payload = {
        tasteId: tasteId,
        saleTempDetailId: saleTempDetailId,
      };
      await axiosInstance.put('/api/sale-temp/select-taste', payload);
      await fetchDataSaleTempInfo(saleTempId);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    } finally {
      setTasteLoadingId(null);
    }
  };

  const unselectTaste = async (
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      setTasteLoadingId(saleTempDetailId);
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };
      await axiosInstance.put(
        '/api/sale-temp/unselect-taste',
        payload
      );
      await fetchDataSaleTempInfo(saleTempId);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    } finally {
      setTasteLoadingId(null);
    }
  };

  const selectSize = async (
    sizeId: number,
    saleTempDetailId: number,
    saleTempId: number
  ) => {
    try {
      const payload = {
        sizeId: sizeId,
        saleTempDetailId: saleTempDetailId,
      };
      await axiosInstance.put('/api/sale-temp/select-size', payload);
      await fetchDataSaleTempInfo(saleTempId);
      await fetchDataSaleTemp();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const unselectSize = async (saleTempDetailId: number, saleTempId: number) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };
      await axiosInstance.put('/api/sale-temp/unselect-size', payload);
      await fetchDataSaleTempInfo(saleTempId);
      await fetchDataSaleTemp();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const createSaleTempDetail = async () => {
    try {
      const payload = {
        saleTempId: saleTempId,
      };
      await axiosInstance.post(
        '/api/sale-temp/create-sale-temp-detail',
        payload
      );
      await fetchDataSaleTemp();
      fetchDataSaleTempInfo(saleTempId);
      toast.success("เพิ่มรายละเอียดสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const removeSaleTempDetail = async (saleTempDetailId: number) => {
    try {
      const payload = {
        saleTempDetailId: saleTempDetailId,
      };
      await axiosInstance.delete(
        '/api/sale-temp/remove-sale-temp-detail',
        { data: payload }
      );
      await fetchDataSaleTemp();
      fetchDataSaleTempInfo(saleTempId);
      toast.success("ลบรายละเอียดสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const printBillBeforePay = async () => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
      };
      const res = await axiosInstance.post(
        '/api/sale-temp/print-bill-before-pay',
        payload
      );
      setTimeout(() => {
        setBillUrl(res.data.fileName);
        setShowPrintDialog(true);
      }, 500);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };
  
  const endSale = async () => {
    try {
        const payload = {
          tableNo: table,
          userId: Number(localStorage.getItem("next_user_id")),
          payType: payType,
          inputMoney: inputMoney,
          amount: amount + amountAdded,
          returnMoney: inputMoney - (amount + amountAdded),
        };
      await axiosInstance.put('/api/sale-temp/end-sale', payload);
        
        fetchDataSaleTemp();
      toast.success("จบการขายสำเร็จ");
      setShowEndSaleDialog(false);
      setInputMoney(0);
        printBillAfterPay();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const printBillAfterPay = async () => {
    try {
      const payload = {
        tableNo: table,
        userId: Number(localStorage.getItem("next_user_id")),
      };
      const res = await axiosInstance.post('/api/sale-temp/print-bill-after-pay', payload);

      setTimeout(() => {
        setBillUrl(res.data.fileName);
        setShowPrintDialog(true);
      }, 300);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };
  const totalAmount = amount + amountAdded;
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ระบบขาย (POS)</h1>
          <p className="text-muted-foreground mt-1">
            จัดการการขายและตะกร้าสินค้า
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="table" className="whitespace-nowrap font-medium text-sm">โต๊ะ:</Label>
          <Input
            id="table"
            type="number"
            value={table}
            onChange={(e) => setTable(Number(e.target.value))}
            className="w-24"
            min="1"
          />
        </div>
      </div>

      {/* Control Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">กรอง:</span>
              <Button
                variant="outline"
                onClick={() => filterFoods("food")}
                size="sm"
              >
                อาหาร
              </Button>
              <Button
                variant="outline"
                onClick={() => filterFoods("drink")}
                size="sm"
              >
                เครื่องดื่ม
              </Button>
              <Button
                variant="outline"
                onClick={() => getFoods()}
                size="sm"
              >
                ทั้งหมด
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAllDialog(true)}
                disabled={saleTemps.length === 0}
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                ล้างรายการ
              </Button>
              {amount > 0 && (
                <Button
                  variant="default"
                  onClick={printBillBeforePay}
                  size="sm"
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">พิมพ์ใบแจ้งรายการ</span>
                  <span className="sm:hidden">พิมพ์</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Food List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                รายการอาหาร
              </CardTitle>
              <CardDescription>
                คลิกเพื่อเพิ่มรายการลงตะกร้า ({foods.length} รายการ)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {foods.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">ไม่มีรายการอาหาร</p>
                  <p className="text-sm mt-1">กรุณาเพิ่มรายการอาหารในระบบก่อน</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {foods.map((food) => (
                    <Card
                      key={food.id}
                      className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/50 group overflow-hidden"
                      onClick={() => sale(food.id)}
                    >
                      {food.img && (
                        <div className="w-full overflow-hidden bg-muted aspect-square">
                          <img
                            src={getImageUrl(`uploads/${food.img}`)}
                            alt={food.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                          {food.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                          <p className="text-base sm:text-lg font-bold text-primary">
                            ฿{food.price?.toLocaleString()}
                          </p>
                          <Badge variant="secondary" className="text-xs w-fit">
                            คลิกเพื่อเพิ่ม
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart Sidebar */}
        <div className="space-y-4 order-1 lg:order-2">
          {/* Total Amount Display */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm opacity-90 mb-2">ยอดรวมทั้งหมด</p>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  ฿{totalAmount.toLocaleString("th-TH")}
                </div>
                {amountAdded > 0 && (
                  <p className="text-xs opacity-75 mt-2">
                    รวมเพิ่มเติม: ฿{amountAdded.toLocaleString("th-TH")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* End Sale Button */}
          {amount > 0 && (
            <Button
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
              onClick={() => {
                if (saleTemps.length === 0) {
                  toast.warning("ไม่มีรายการในตะกร้า");
                  return;
                }
                setShowEndSaleDialog(true);
              }}
              disabled={saleTemps.length === 0}
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              จบการขาย
            </Button>
          )}

          {/* Cart Items */}
          <Card className="flex flex-col h-full min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                ตะกร้าสินค้า
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {saleTemps.length} รายการ
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden min-h-0">
              <div className="space-y-3 max-h-[500px] sm:max-h-[600px] md:max-h-[650px] lg:max-h-[calc(100vh-420px)] xl:max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
                {saleTemps.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm sm:text-base font-medium">ตะกร้าว่าง</p>
                    <p className="text-xs sm:text-sm mt-1">เลือกอาหารเพื่อเพิ่มลงตะกร้า</p>
                  </div>
                ) : (
                  saleTemps.map((item) => (
                    <Card key={item.id} className="border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all duration-200">
                      <CardContent className="p-2.5 sm:p-3">
                        <div className="space-y-2.5">
                          {/* Header with name and action buttons */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-1 text-foreground">
                                {item.Food?.name}
                              </h4>
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-xs text-muted-foreground">
                                  ฿{item.Food?.price?.toLocaleString()} × {item.qty}
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                                  = ฿{(item.Food?.price * item.qty)?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="default"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/90 transition-colors"
                                onClick={() => {
                                  setSaleTempId(item.id);
                                  openModalEdit(item);
                                }}
                                title="แก้ไข"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/90 transition-colors"
                                onClick={() => setDeleteSaleTempId(item.id)}
                                title="ยกเลิก"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 bg-muted/60 rounded-lg p-2 border border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0 hover:bg-muted transition-colors"
                              disabled={(item.SaleTempDetails?.length ?? 0) > 0 || item.qty <= 0}
                              onClick={() => {
                                if (item.qty > 0) {
                                  updateQty(item.id, item.qty - 1);
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="flex-1 text-center">
                              <span className="text-sm sm:text-base font-bold text-foreground">
                                {item.qty}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0 hover:bg-muted transition-colors"
                              disabled={(item.SaleTempDetails?.length ?? 0) > 0}
                              onClick={() => updateQty(item.id, item.qty + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Edit Detail Modal */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="max-w-[90vw] lg:max-w-5xl xl:max-w-6xl max-h-[90vh] w-full p-0">
           <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
             <DialogTitle className="text-lg sm:text-xl lg:text-2xl">แก้ไขรายการ</DialogTitle>
             <DialogDescription className="text-xs sm:text-sm">
               เลือกรสชาติและขนาดอาหารสำหรับรายการนี้
             </DialogDescription>
           </DialogHeader>
           <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
             <Button
               onClick={createSaleTempDetail}
               className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold"
             >
               <Plus className="h-4 w-4 mr-2" />
               เพิ่มรายการ
             </Button>
             
             {saleTempDetails.length === 0 ? (
               <div className="text-center py-8 sm:py-12 text-muted-foreground">
                 <Edit className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 opacity-50" />
                 <p className="text-sm sm:text-base">ไม่มีรายละเอียด</p>
                 <p className="text-xs sm:text-sm mt-1">คลิกปุ่ม "เพิ่มรายการ" เพื่อเพิ่มรายละเอียด</p>
               </div>
             ) : (
               <>
                 {/* Mobile Card View */}
                 <div className="block md:hidden space-y-3 sm:space-y-4">
                   {saleTempDetails.map((detail) => (
                     <Card key={detail.id} className="border">
                       <CardContent className="p-4 space-y-3 sm:space-y-4">
                         {/* Header with food name and delete button */}
                         <div className="flex items-start justify-between gap-2">
                           <div className="flex-1 min-w-0">
                             <h4 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
                               {detail.Food?.name}
                             </h4>
                           </div>
                           <Button
                             variant="destructive"
                             size="icon"
                             className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                             onClick={() => removeSaleTempDetail(detail.id)}
                           >
                             <X className="h-4 w-4" />
                           </Button>
                         </div>

                         {/* Tastes Section */}
                         <div className="space-y-2">
                           <Label className="text-sm sm:text-base font-semibold text-muted-foreground">รสชาติ</Label>
                           {tastes.length === 0 ? (
                             <p className="text-xs sm:text-sm text-muted-foreground">ไม่มีรสชาติ</p>
                           ) : (
                             <div className="flex flex-wrap gap-2">
                               {tastes.map((taste) => {
                                 const isSelected = detail.Taste?.id === taste.id;
                                 const isLoading = tasteLoadingId === detail.id;
                                 return (
                                   <Button
                                     key={taste.id}
                                     variant={isSelected ? "default" : "outline"}
                                     size="sm"
                                     className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                                     disabled={isLoading}
                                     onClick={async () => {
                                       if (isSelected) {
                                         await unselectTaste(detail.id, saleTempId);
                                       } else {
                                         await selectTaste(taste.id, detail.id, saleTempId);
                                       }
                                     }}
                                   >
                                     {taste.name}
                                   </Button>
                                 );
                               })}
                             </div>
                           )}
                         </div>

                         {/* Sizes Section */}
                         <div className="space-y-2">
                           <Label className="text-sm sm:text-base font-semibold text-muted-foreground">ขนาด</Label>
                           {sizes.filter((s) => s.moneyAdded > 0).length === 0 ? (
                             <p className="text-xs sm:text-sm text-muted-foreground">ไม่มีขนาด</p>
                           ) : (
                             <div className="flex flex-wrap gap-2">
                               {sizes.map((size) => (
                                 size.moneyAdded > 0 && (
                                   <Button
                                     key={size.id}
                                     variant={detail.FoodSize?.id === size.id ? "default" : "outline"}
                                     size="sm"
                                     className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                                     onClick={() => {
                                       if (detail.FoodSize?.id === size.id) {
                                         unselectSize(detail.id, saleTempId);
                                       } else {
                                         selectSize(size.id, detail.id, saleTempId);
                                       }
                                     }}
                                   >
                                     +{size.moneyAdded} {size.name}
                                   </Button>
                                 )
                               ))}
                             </div>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>

                 {/* Desktop Table View */}
                 <div className="hidden md:block border rounded-lg overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead className="bg-muted">
                         <tr>
                           <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold w-[80px] sm:w-[100px]">จัดการ</th>
                           <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold min-w-[150px] sm:min-w-[200px]">ชื่ออาหาร</th>
                           <th className="p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold min-w-[250px] sm:min-w-[300px]">รสชาติ</th>
                           <th className="p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold min-w-[250px] sm:min-w-[300px]">ขนาด</th>
                         </tr>
                       </thead>
                       <tbody>
                         {saleTempDetails.map((detail) => (
                           <tr key={detail.id} className="border-t hover:bg-muted/30 transition-colors">
                             <td className="p-3 sm:p-4 text-center">
                               <Button
                                 variant="destructive"
                                 size="icon"
                                 className="h-8 w-8 sm:h-9 sm:w-9"
                                 onClick={() => removeSaleTempDetail(detail.id)}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                             </td>
                             <td className="p-3 sm:p-4">
                               <span className="font-medium text-sm sm:text-base">{detail.Food?.name}</span>
                             </td>
                             <td className="p-3 sm:p-4">
                               <div className="flex flex-wrap gap-2 justify-center">
                                 {tastes.length === 0 ? (
                                   <span className="text-xs sm:text-sm text-muted-foreground">ไม่มีรสชาติ</span>
                                 ) : (
                                   tastes.map((taste) => {
                                     const isSelected = detail.Taste?.id === taste.id;
                                     const isLoading = tasteLoadingId === detail.id;
                                     return (
                                       <Button
                                         key={taste.id}
                                         variant={isSelected ? "default" : "outline"}
                                         size="sm"
                                         className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                                         disabled={isLoading}
                                         onClick={async () => {
                                           if (isSelected) {
                                             await unselectTaste(detail.id, saleTempId);
                                           } else {
                                             await selectTaste(taste.id, detail.id, saleTempId);
                                           }
                                         }}
                                       >
                                         {taste.name}
                                       </Button>
                                     );
                                   })
                                 )}
                               </div>
                             </td>
                             <td className="p-3 sm:p-4">
                               <div className="flex flex-wrap gap-2 justify-center">
                                 {sizes.filter((s) => s.moneyAdded > 0).length === 0 ? (
                                   <span className="text-xs sm:text-sm text-muted-foreground">ไม่มีขนาด</span>
                                 ) : (
                                   sizes.map((size) => (
                                     size.moneyAdded > 0 && (
                                       <Button
                                         key={size.id}
                                         variant={detail.FoodSize?.id === size.id ? "default" : "outline"}
                                         size="sm"
                                         className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                                         onClick={() => {
                                           if (detail.FoodSize?.id === size.id) {
                                             unselectSize(detail.id, saleTempId);
                                           } else {
                                             selectSize(size.id, detail.id, saleTempId);
                                           }
                                         }}
                                       >
                                         +{size.moneyAdded} {size.name}
                                       </Button>
                                     )
                                   ))
                                 )}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* End Sale Dialog */}
       <Dialog open={showEndSaleDialog} onOpenChange={setShowEndSaleDialog}>
         <DialogContent className="max-w-2xl w-[90vw] sm:w-full">
           <DialogHeader>
             <DialogTitle className="text-lg sm:text-xl">จบการขาย</DialogTitle>
             <DialogDescription className="text-xs sm:text-sm">
               กรุณากรอกข้อมูลการชำระเงิน
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-3 sm:space-y-4 py-2">
             {/* Payment Type */}
             <div className="space-y-2">
               <Label className="text-xs sm:text-sm font-semibold">รูปแบบการชำระ</Label>
               <div className="grid grid-cols-2 gap-2">
                 <Button
                   variant={payType === "cash" ? "default" : "outline"}
                   size="lg"
                   className="h-12 sm:h-14 text-sm sm:text-base font-semibold"
                   onClick={() => setPayType("cash")}
                 >
                   <Banknote className="h-4 w-4 mr-2" />
                   เงินสด
                 </Button>
                 <Button
                   variant={payType === "transfer" ? "default" : "outline"}
                   size="lg"
                   className="h-12 sm:h-14 text-sm sm:text-base font-semibold"
                   onClick={() => setPayType("transfer")}
                 >
                   <CreditCard className="h-4 w-4 mr-2" />
                   เงินโอน
                 </Button>
               </div>
             </div>

             {/* Total Amount */}
             <div className="space-y-2">
               <Label className="text-xs sm:text-sm font-semibold">ยอดเงิน</Label>
               <Card className="bg-muted">
                 <CardContent className="p-3">
                   <div className="text-right">
                     <div className="text-xl sm:text-2xl font-bold">
                       ฿{totalAmount.toLocaleString("th-TH")}
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">บาท</p>
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Input Money */}
             <div className="space-y-2">
               <Label className="text-xs sm:text-sm font-semibold">รับเงิน</Label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 {[50, 100, 500, 1000].map((amount) => (
                   <Button
                     key={amount}
                     variant={inputMoney === amount ? "default" : "outline"}
                     size="lg"
                     className="h-10 sm:h-12 text-xs sm:text-sm font-semibold"
                     onClick={() => setInputMoney(amount)}
                   >
                     ฿{amount}
                   </Button>
                 ))}
               </div>
               <Input
                 type="number"
                 value={inputMoney || ''}
                 onChange={(e) => setInputMoney(Number(e.target.value) || 0)}
                 placeholder="0.00"
                 className="text-base sm:text-lg text-end p-3 font-semibold"
                 min="0"
               />
             </div>

             {/* Return Money */}
             <div className="space-y-2">
               <Label className="text-xs sm:text-sm font-semibold">เงินทอน</Label>
               <Card className={inputMoney - totalAmount >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                 <CardContent className="p-3">
                   <div className="text-right">
                     <div className={`text-xl sm:text-2xl font-bold ${inputMoney - totalAmount >= 0 ? "text-green-700" : "text-red-600"}`}>
                       ฿{Math.max(0, inputMoney - totalAmount).toLocaleString("th-TH")}
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">บาท</p>
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Action Buttons */}
             <div className="grid grid-cols-2 gap-2 pt-2">
               <Button
                 variant="outline"
                 size="lg"
                 className="h-10 sm:h-11 text-xs sm:text-sm"
                 onClick={() => setInputMoney(totalAmount)}
               >
                 จ่ายพอดี
               </Button>
               <Button
                 size="lg"
                 className="h-10 sm:h-11 text-xs sm:text-sm font-semibold"
                 onClick={endSale}
                 disabled={inputMoney < totalAmount}
               >
                 <Check className="h-4 w-4 mr-2" />
                 จบการขาย
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Print Dialog */}
       <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
         <DialogContent className="max-w-5xl max-h-[90vh] w-[95vw] sm:w-full">
           <DialogHeader>
             <DialogTitle className="text-lg sm:text-xl">พิมพ์เอกสาร</DialogTitle>
             <DialogDescription className="text-sm sm:text-base">
               เอกสารใบเสร็จสำหรับการพิมพ์
             </DialogDescription>
           </DialogHeader>
           {billUrl && (
             <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border-2 rounded-lg overflow-hidden bg-muted/30">
               <iframe
                 src={getImageUrl(billUrl.startsWith('uploads/') ? billUrl : `uploads/${billUrl}`)}
                 className="w-full h-full"
                 title="Print Document"
               />
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Delete Confirmation Dialogs */}
       <AlertDialog open={deleteSaleTempId !== null} onOpenChange={(open) => !open && setDeleteSaleTempId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
             <AlertDialogDescription>
               คุณต้องการลบรายการนี้หรือไม่?
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setDeleteSaleTempId(null)}>
               ยกเลิก
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={removeSaleTemp}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               ลบ
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>ยืนยันการลบทั้งหมด</AlertDialogTitle>
             <AlertDialogDescription>
               คุณต้องการลบรายการทั้งหมดหรือไม่?
               <br />
               การกระทำนี้ไม่สามารถยกเลิกได้
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setShowDeleteAllDialog(false)}>
               ยกเลิก
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={removeAllSaleTemp}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               ลบทั้งหมด
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

    </div>
  );
}

export default SaleTempPage




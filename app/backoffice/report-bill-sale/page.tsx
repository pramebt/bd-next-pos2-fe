// Report Bill Sale Page
"use client";

import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { 
  Search, 
  Trash2, 
  FileText, 
  Calendar,
  Loader2,
  Receipt,
  User,
  DollarSign,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface BillSaleDetail {
  id: number;
  qty: number;
  price: number;
  moneyAdded: number;
  foodSizeId?: number;
  Food: {
    id: number;
    name: string;
  };
  Taste: {
    id: number;
    name: string;
  } | null;
  FoodSize: {
    id: number;
    name: string;
    moneyAdded: number;
  } | null;
}

interface BillSale {
  id: number;
  tableNo: number;
  payDate: string;
  payType: string;
  amount: number;
  inputMoney: number;
  returnMoney: number;
  User: {
    id: number;
    name: string;
  };
  BillSaleDetails: BillSaleDetail[];
}

const ReportBillSalePage = () => {
  const [billSales, setBillSales] = useState<BillSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedBill, setSelectedBill] = useState<BillSale | null>(null);
  const [sumAmount, setSumAmount] = useState(0);
  const isFirstLoad = useRef(true);

  // Set default dates to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(dayjs(firstDay).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs(lastDay).format('YYYY-MM-DD'));

  useEffect(() => {
    // Fetch data automatically only on first load
    if (isFirstLoad.current && startDate && endDate) {
      isFirstLoad.current = false;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      toast.warning("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const payload = {
        startDate: startDate,
        endDate: endDate
      };

      const res = await axiosInstance.post(`${apiUrl}/api/bill-sale/list`, payload);
      const results = res.data.results || [];
      setBillSales(results);

      const sum = results.reduce((total: number, bill: BillSale) => total + bill.amount, 0);
      setSumAmount(sum);

      if (results.length === 0) {
        toast.info("ไม่พบข้อมูลในช่วงวันที่ที่เลือก");
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error.response?.data?.message || error.message || "ไม่สามารถโหลดข้อมูลได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBill = async () => {
    if (!deleteId) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axiosInstance.delete(`${apiUrl}/api/bill-sale/delete`, {
        data: { id: deleteId }
      });
      
      toast.success("ยกเลิกบิลสำเร็จ");
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error.response?.data?.message || error.message || "ไม่สามารถยกเลิกบิลได้",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">รายงานบิลขาย</h1>
          <p className="text-muted-foreground mt-1">
            ดูรายละเอียดบิลขายตามช่วงวันที่
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            กรองตามวันที่
          </CardTitle>
          <CardDescription>
            เลือกช่วงวันที่เพื่อดูรายงานบิลขาย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">จากวันที่</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">ถึงวันที่</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                onClick={fetchData}
                disabled={isLoading || !startDate || !endDate}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    แสดงรายการ
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {billSales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">จำนวนบิล</p>
                  <p className="text-3xl font-bold">{billSales.length}</p>
                </div>
                <Receipt className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">ยอดขายรวม</p>
                  <p className="text-3xl font-bold">
                    ฿{sumAmount.toLocaleString('th-TH')}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bill Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            รายการบิลขาย
          </CardTitle>
          <CardDescription>
            {billSales.length > 0 
              ? `พบ ${billSales.length} รายการ` 
              : "ยังไม่มีข้อมูล"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : billSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-base">ยังไม่มีข้อมูลบิลขาย</p>
              <p className="text-sm mt-1">กรุณาเลือกช่วงวันที่และคลิกแสดงรายการ</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {billSales.map((bill) => (
                  <Card key={bill.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-semibold">
                              บิล #{bill.id}
                            </Badge>
                            <Badge variant="secondary">
                              โต๊ะ {bill.tableNo}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {formatDate(bill.payDate)}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{bill.User?.name || '-'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ฿{bill.amount.toLocaleString('th-TH')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {bill.BillSaleDetails.length} รายการ
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => setDeleteId(bill.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ยกเลิกบิล
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px] text-center">จัดการ</TableHead>
                      <TableHead className="w-[200px] text-center">วันที่</TableHead>
                      <TableHead>รหัสบิล</TableHead>
                      <TableHead className="w-[150px]">พนักงานขาย</TableHead>
                      <TableHead className="w-[100px] text-end">โต๊ะ</TableHead>
                      <TableHead className="w-[100px] text-end">จำนวนเงิน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billSales.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBill(bill)}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="hidden lg:inline">รายละเอียด</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteId(bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {formatDate(bill.payDate)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {bill.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{bill.User?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-end">
                          <Badge variant="outline">{bill.tableNo}</Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <span className="font-semibold text-lg text-primary">
                            ฿{bill.amount.toLocaleString('th-TH')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-semibold">
                        รวม
                      </TableCell>
                      <TableCell className="text-end">
                        <span className="font-bold text-lg text-primary">
                          ฿{sumAmount.toLocaleString('th-TH')}
                        </span>
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bill Detail Dialog */}
      <Dialog open={selectedBill !== null} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              รายละเอียดบิล #{selectedBill?.id}
            </DialogTitle>
            <DialogDescription>
              โต๊ะ {selectedBill?.tableNo} • {selectedBill && formatDate(selectedBill.payDate)}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">พนักงาน</p>
                  <p className="font-semibold">{selectedBill.User?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ประเภทการชำระ</p>
                  <Badge 
                    variant={selectedBill.payType === 'cash' ? 'default' : 'secondary'}
                  >
                    {selectedBill.payType === 'cash' ? 'เงินสด' : selectedBill.payType === 'transfer' ? 'เงินโอน' : selectedBill.payType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รับเงิน</p>
                  <p className="font-semibold">฿{selectedBill.inputMoney.toLocaleString('th-TH')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เงินทอน</p>
                  <p className="font-semibold">฿{selectedBill.returnMoney.toLocaleString('th-TH')}</p>
                </div>
              </div>

              {/* Bill Details */}
              <div>
                <h3 className="font-semibold mb-3">รายการอาหาร</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รายการ</TableHead>
                        <TableHead className="text-end">ราคา</TableHead>
                        <TableHead>รสชาติ</TableHead>
                        <TableHead>ขนาด</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBill.BillSaleDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.Food?.name || '-'}
                          </TableCell>
                          <TableCell className="text-end">
                            <span className="font-semibold">
                              ฿{(detail.price + detail.moneyAdded).toLocaleString('th-TH')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {detail.Taste?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {detail.foodSizeId && detail.FoodSize
                              ? `${detail.FoodSize.name} +฿${detail.moneyAdded.toLocaleString('th-TH')}`
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">ยอดรวม</p>
                  <p className="text-2xl font-bold text-primary">
                    ฿{selectedBill.amount.toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกบิล</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการยกเลิกบิลนี้หรือไม่?
              <br />
              การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBill}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportBillSalePage;

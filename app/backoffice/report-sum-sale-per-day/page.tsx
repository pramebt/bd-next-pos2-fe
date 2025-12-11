// Report Sum Sale Per Day Page
"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  Calendar,
  Loader2,
  Search,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DayReport {
  date: string;
  amount: number;
}

const ReportSumSalePerDayPage = () => {
  const [arrYear, setArrYear] = useState<number[]>([]);
  const [arrMonth, setArrMonth] = useState([
    { value: 1, label: "มกราคม" },
    { value: 2, label: "กุมภาพันธ์" },
    { value: 3, label: "มีนาคม" },
    { value: 4, label: "เมษายน" },
    { value: 5, label: "พฤษภาคม" },
    { value: 6, label: "มิถุนายน" },
    { value: 7, label: "กรกฎาคม" },
    { value: 8, label: "สิงหาคม" },
    { value: 9, label: "กันยายน" },
    { value: 10, label: "ตุลาคม" },
    { value: 11, label: "พฤศจิกายน" },
    { value: 12, label: "ธันวาคม" },
  ]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [data, setData] = useState<DayReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    setArrYear(Array.from({ length: 5 }, (_, index) => dayjs().year() - index));
  }, []);

  useEffect(() => {
    // Fetch data automatically only on first load
    if (isFirstLoad.current && selectedYear && selectedMonth) {
      isFirstLoad.current = false;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(
        `${apiUrl}/api/report/report-sum-sale-per-day/${selectedYear}/${selectedMonth}`
      );
      const results = res.data.results || [];
      setData(results);
      setTotalAmount(sumTotalAmount(results));

      if (results.length === 0) {
        toast.info("ไม่พบข้อมูลในช่วงเวลาที่เลือก");
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลดข้อมูลได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sumTotalAmount = (data: DayReport[]) => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getDayName = (dateString: string) => {
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    return dayNames[dayjs(dateString).day()];
  };

  const getMaxAmount = () => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item) => item.amount));
  };

  const maxAmount = getMaxAmount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            รายงานยอดขายรายวัน
          </h1>
          <p className="text-muted-foreground mt-1">
            ดูยอดขายรายวันตามปีและเดือนที่เลือก
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            เลือกปีและเดือน
          </CardTitle>
          <CardDescription>
            เลือกปีและเดือนเพื่อดูรายงานยอดขายรายวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">ปี</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="เลือกปี" />
                </SelectTrigger>
                <SelectContent>
                  {arrYear.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">เดือน</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  {arrMonth.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                onClick={fetchData}
                disabled={isLoading}
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
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">ยอดขายรวม</p>
                  <p className="text-3xl font-bold">
                    ฿{totalAmount.toLocaleString("th-TH")}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">วันที่มีการขาย</p>
                  <p className="text-3xl font-bold">
                    {data.filter((item) => item.amount > 0).length} วัน
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            รายงานยอดขายรายวัน
          </CardTitle>
          <CardDescription>
            {data.length > 0
              ? `เดือน${arrMonth.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
              : "ยังไม่มีข้อมูล"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-base">ยังไม่มีข้อมูล</p>
              <p className="text-sm mt-1">
                กรุณาเลือกปีและเดือนแล้วคลิกแสดงรายการ
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {data.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-semibold">
                              {formatDate(item.date)}
                            </Badge>
                            <Badge variant="secondary">
                              {getDayName(item.date)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ฿{item.amount.toLocaleString("th-TH")}
                          </p>
                        </div>
                      </div>
                      {maxAmount > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(item.amount / maxAmount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">วันที่</TableHead>
                      <TableHead className="w-[80px]">วัน</TableHead>
                      <TableHead>ยอดขาย</TableHead>
                      <TableHead className="w-[200px]">กราฟ</TableHead>
                      <TableHead className="w-[150px] text-right">จำนวนเงิน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getDayName(item.date)}</Badge>
                        </TableCell>
                        <TableCell>
                          {maxAmount > 0 && (
                            <div className="w-full bg-muted rounded-full h-4">
                              <div
                                className="bg-primary h-4 rounded-full transition-all flex items-center justify-end pr-2"
                                style={{
                                  width: `${(item.amount / maxAmount) * 100}%`,
                                  minWidth: item.amount > 0 ? "40px" : "0",
                                }}
                              >
                                {item.amount > 0 && (
                                  <span className="text-xs text-primary-foreground font-semibold">
                                    {((item.amount / maxAmount) * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.amount > 0 ? (
                            <Badge variant="default" className="font-semibold">
                              มีการขาย
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              ไม่มีการขาย
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-lg text-primary">
                            ฿{item.amount.toLocaleString("th-TH")}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">
                        รวม
                      </TableCell>
                      <TableCell className="text-end">
                        <span className="font-bold text-lg text-primary">
                          ฿{totalAmount.toLocaleString("th-TH")}
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
    </div>
  );
};

export default ReportSumSalePerDayPage;

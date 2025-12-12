// Dashboard Page
"use client";

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '@/lib/axios';
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  Calendar,
  Loader2,
  DollarSign,
  TrendingUp,
  BarChart3,
  LineChart,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DayReport {
  date: string;
  amount: number;
}

interface MonthReport {
  month: string;
  amount: number;
}

const DashboardPage = () => {
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

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [selectedYearForDay, setSelectedYearForDay] = useState<number>(currentYear);
  const [selectedMonthForDay, setSelectedMonthForDay] = useState<number>(currentMonth);
  const [selectedYearForMonth, setSelectedYearForMonth] = useState<number>(currentYear);

  const [dayData, setDayData] = useState<DayReport[]>([]);
  const [monthData, setMonthData] = useState<MonthReport[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState<boolean>(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    setArrYear(Array.from({ length: 5 }, (_, index) => dayjs().year() - index));
  }, []);

  useEffect(() => {
    // Fetch data automatically only on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      fetchDayData();
      fetchMonthData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDayData = async () => {
    try {
      setIsLoadingDay(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axiosInstance.get(
        `${apiUrl}/api/report/report-sum-sale-per-day/${selectedYearForDay}/${selectedMonthForDay}`
      );
      const results = res.data.results || [];
      setDayData(results);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลดข้อมูลยอดขายรายวันได้",
      });
    } finally {
      setIsLoadingDay(false);
    }
  };

  const fetchMonthData = async () => {
    try {
      setIsLoadingMonth(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axiosInstance.get(
        `${apiUrl}/api/report/report-sum-sale-per-month/${selectedYearForMonth}`
      );
      const results = res.data.results || [];
      setMonthData(results);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลดข้อมูลยอดขายรายเดือนได้",
      });
    } finally {
      setIsLoadingMonth(false);
    }
  };

  const getMonthName = (monthValue: string) => {
    const monthNum = parseInt(monthValue);
    const month = arrMonth.find((m) => m.value === monthNum);
    return month ? month.label : `เดือน ${monthValue}`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM");
  };

  // Calculate totals
  const totalDayAmount = dayData.reduce((sum, item) => sum + item.amount, 0);
  const totalMonthAmount = monthData.reduce((sum, item) => sum + item.amount, 0);
  const avgDayAmount = dayData.length > 0 ? totalDayAmount / dayData.length : 0;
  const daysWithSales = dayData.filter((item) => item.amount > 0).length;
  const monthsWithSales = monthData.filter((item) => item.amount > 0).length;

  // Chart data for daily sales
  const dayChartData = {
    labels: dayData.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "ยอดขาย (บาท)",
        data: dayData.map((item) => item.amount),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
    ],
  };

  // Chart data for monthly sales
  const monthChartData = {
    labels: monthData.map((item) => getMonthName(item.month)),
    datasets: [
      {
        label: "ยอดขาย (บาท)",
        data: monthData.map((item) => item.amount),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `ยอดขาย: ฿${context.parsed.y.toLocaleString("th-TH")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "฿" + value.toLocaleString("th-TH");
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">แดชบอร์ด</h1>
          <p className="text-muted-foreground mt-1">
            สรุปยอดขายรายวันและรายเดือน
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวมรายวัน</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{totalDayAmount.toLocaleString("th-TH")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {arrMonth.find((m) => m.value === selectedMonthForDay)?.label} {selectedYearForDay}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายเฉลี่ยรายวัน</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{avgDayAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              เฉลี่ยต่อวัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวมรายเดือน</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{totalMonthAmount.toLocaleString("th-TH")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ปี {selectedYearForMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">วันที่มีการขาย</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysWithSales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              จาก {dayData.length} วัน
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                กราฟยอดขายรายวัน
              </CardTitle>
              <CardDescription>
                ยอดขายรายวันตามปีและเดือนที่เลือก
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="space-y-1">
                <Label htmlFor="year-day" className="text-xs">ปี</Label>
                <Select
                  value={selectedYearForDay.toString()}
                  onValueChange={(value) => {
                    setSelectedYearForDay(Number(value));
                  }}
                  disabled={isLoadingDay}
                >
                  <SelectTrigger id="year-day" className="w-[120px]">
                    <SelectValue />
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
              <div className="space-y-1">
                <Label htmlFor="month-day" className="text-xs">เดือน</Label>
                <Select
                  value={selectedMonthForDay.toString()}
                  onValueChange={(value) => {
                    setSelectedMonthForDay(Number(value));
                  }}
                  disabled={isLoadingDay}
                >
                  <SelectTrigger id="month-day" className="w-[140px]">
                    <SelectValue />
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
              <div className="flex items-end">
                <Button
                  onClick={fetchDayData}
                  disabled={isLoadingDay}
                  size="default"
                  className="gap-2"
                >
                  {isLoadingDay ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังโหลด...
                    </>
                  ) : (
                    "ค้นหา"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDay ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dayData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีข้อมูล</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <Bar data={dayChartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                กราฟยอดขายรายเดือน
              </CardTitle>
              <CardDescription>
                ยอดขายรายเดือนตามปีที่เลือก
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="space-y-1">
                <Label htmlFor="year-month" className="text-xs">ปี</Label>
                <Select
                  value={selectedYearForMonth.toString()}
                  onValueChange={(value) => {
                    setSelectedYearForMonth(Number(value));
                  }}
                  disabled={isLoadingMonth}
                >
                  <SelectTrigger id="year-month" className="w-[120px]">
                    <SelectValue />
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
              <div className="flex items-end">
                <Button
                  onClick={fetchMonthData}
                  disabled={isLoadingMonth}
                  size="default"
                  className="gap-2"
                >
                  {isLoadingMonth ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังโหลด...
                    </>
                  ) : (
                    "ค้นหา"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingMonth ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : monthData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีข้อมูล</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <Bar data={monthChartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

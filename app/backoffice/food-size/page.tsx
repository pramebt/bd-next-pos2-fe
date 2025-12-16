// Food Size Page
"use client";
import axiosInstance from '@/lib/axios';
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/shared/Mymodal";
import type { FoodSize, FoodType, ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

const FoodSizePage = () => {
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [foodTypeId, setFoodTypeId] = useState<number>(0);
  const [moneyAdded, setMoneyAdded] = useState<number>(0);
  const [foodSizes, setFoodSizes] = useState<FoodSize[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    fetchDataFoodType();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse<FoodSize[]>>('/api/food-size/list');
      setFoodSizes(response.data.result || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลขนาดอาหาร", {
        description: getErrorMessage(error),
      });
    }
  };

  const fetchDataFoodType = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse<FoodType[]>>('/api/food-type/list');
      setFoodTypes(response.data.result || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทอาหาร", {
        description: getErrorMessage(error),
      });
    }
  };

  const editFoodSize = (foodSize: FoodSize) => {
    setId(foodSize.id);
    setName(foodSize.name);
    setRemark(foodSize.remark || "");
    setFoodTypeId(foodSize.foodTypeId);
    setMoneyAdded(foodSize.moneyAdded);
    setIsModalOpen(true);
  };

  const clearForm = () => {
    setId(0);
    setName("");
    setRemark("");
    setFoodTypeId(0);
    setMoneyAdded(0);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อขนาดอาหาร");
      return;
    }

    if (foodTypeId === 0) {
      toast.warning("กรุณาเลือกประเภทอาหาร");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        remark: remark.trim(),
        foodTypeId: foodTypeId,
        moneyAdded: moneyAdded || 0,
        id: id,
      };

      if (id === 0) {
        await axiosInstance.post('/api/food-size/create', payload);
        toast.success("เพิ่มขนาดอาหารสำเร็จ");
      } else {
        await axiosInstance.put(`/api/food-size/update/${id}`, payload);
        toast.success("แก้ไขขนาดอาหารสำเร็จ");
      }
      fetchData();
      clearForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await axiosInstance.delete(`/api/food-size/delete/${deleteId}`);
      toast.success("ลบขนาดอาหารสำเร็จ");
      fetchData();
      setDeleteId(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const openAddModal = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const getFoodTypeName = (foodTypeId: number) => {
    const foodType = foodTypes.find((ft) => ft.id === foodTypeId);
    return foodType?.name || "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการขนาดอาหาร</h1>
          <p className="text-muted-foreground mt-1">
            เพิ่ม แก้ไข หรือลบขนาดอาหาร
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มขนาดอาหาร
        </Button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        id="modalFoodSize"
        title={id === 0 ? "เพิ่มขนาดอาหาร" : "แก้ไขขนาดอาหาร"}
        modalSize="md"
        description="กรุณากรอกข้อมูลขนาดอาหาร"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="foodType" className="text-sm font-medium">
              ประเภทอาหาร <span className="text-destructive">*</span>
            </label>
            <Select
              value={foodTypeId.toString()}
              onValueChange={(value) => setFoodTypeId(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเภทอาหาร" />
              </SelectTrigger>
              <SelectContent>
                {foodTypes.map((foodType) => (
                  <SelectItem key={foodType.id} value={foodType.id.toString()}>
                    {foodType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              ชื่อขนาดอาหาร <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรุณากรอกชื่อขนาดอาหาร"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="moneyAdded" className="text-sm font-medium">
              ราคาเพิ่มเติม (บาท)
            </label>
            <Input
              id="moneyAdded"
              type="number"
              value={moneyAdded}
              onChange={(e) => setMoneyAdded(Number(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="remark" className="text-sm font-medium">
              หมายเหตุ
            </label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="กรุณากรอกหมายเหตุ (ถ้ามี)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                clearForm();
              }}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการขนาดอาหาร</CardTitle>
          <CardDescription>
            รายการขนาดอาหารทั้งหมด {foodSizes.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foodSizes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>ยังไม่มีข้อมูลขนาดอาหาร</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มขนาดอาหาร" เพื่อเพิ่มข้อมูล
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {foodSizes.map((foodSize, index) => (
                  <Card key={foodSize.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="shrink-0">
                              #{index + 1}
                            </Badge>
                            <Badge variant="secondary" className="shrink-0">
                              {getFoodTypeName(foodSize.foodTypeId)}
                            </Badge>
                            <h3 className="font-semibold text-base truncate">{foodSize.name}</h3>
                          </div>
                          {foodSize.moneyAdded > 0 && (
                            <div className="mb-1">
                              <span className="font-semibold text-lg text-primary">
                                +{foodSize.moneyAdded.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground ml-1">บาท</span>
                            </div>
                          )}
                          {foodSize.remark && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {foodSize.remark}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editFoodSize(foodSize)}
                            className="h-8 w-8"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setDeleteId(foodSize.id)}
                                className="h-8 w-8"
                                title="ลบ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณต้องการลบขนาดอาหาร "{foodSize.name}" หรือไม่?
                                  <br />
                                  การกระทำนี้ไม่สามารถยกเลิกได้
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                  ยกเลิก
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  ลบ
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
                      <TableHead className="w-[80px]">ลำดับ</TableHead>
                      <TableHead>ประเภทอาหาร</TableHead>
                      <TableHead>ชื่อขนาดอาหาร</TableHead>
                      <TableHead className="text-right">ราคาเพิ่มเติม</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                      <TableHead className="w-[150px] text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foodSizes.map((foodSize, index) => (
                      <TableRow key={foodSize.id}>
                        <TableCell>
                          <Badge variant="outline">{index + 1}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {getFoodTypeName(foodSize.foodTypeId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-base">
                          {foodSize.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {foodSize.moneyAdded > 0 ? (
                            <>
                              <span className="font-semibold text-lg text-primary">
                                +{foodSize.moneyAdded.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground ml-1">บาท</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {foodSize.remark || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editFoodSize(foodSize)}
                              className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                              title="แก้ไข"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => setDeleteId(foodSize.id)}
                                  className="h-9 w-9 hover:bg-destructive/90 transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณต้องการลบขนาดอาหาร "{foodSize.name}" หรือไม่?
                                    <br />
                                    การกระทำนี้ไม่สามารถยกเลิกได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                    ยกเลิก
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    ลบ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodSizePage;

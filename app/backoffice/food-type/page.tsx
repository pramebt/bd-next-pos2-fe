// Food Type Page
"use client";
import axiosInstance from '@/lib/axios';
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Search, RefreshCw } from "lucide-react";
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
import type { FoodType, Food, ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

const FoodTypePage = () => {
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [filteredFoodTypes, setFilteredFoodTypes] = useState<FoodType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [foodCount, setFoodCount] = useState<number>(0);
  const [deleteFoodTypeName, setDeleteFoodTypeName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter food types based on search query
    if (searchQuery.trim() === "") {
      setFilteredFoodTypes(foodTypes);
    } else {
      const filtered = foodTypes.filter((foodType) =>
        foodType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (foodType.remark && foodType.remark.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFoodTypes(filtered);
    }
  }, [searchQuery, foodTypes]);

  useEffect(() => {
    // Auto-focus on name input when modal opens
    if (isModalOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const fetchData = async () => {
    try {
      setIsFetching(true);
      
      const response = await axiosInstance.get<ApiResponse<FoodType[]>>('/api/food-type/list');
      const data = response.data.result || [];
      setFoodTypes(data);
      setFilteredFoodTypes(data);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsFetching(false);
    }
  };

  const checkFoodCount = async (foodTypeId: number) => {
    try {
      
      const response = await axiosInstance.get<ApiResponse<Food[]>>('/api/food/list');
      const foods = response.data.result || [];
      const count = foods.filter((food) => food.foodTypeId === foodTypeId).length;
      return count;
    } catch (error) {
      return 0;
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedRemark = remark.trim();

    if (!trimmedName) {
      toast.warning("กรุณากรอกชื่อประเภทอาหาร");
      nameInputRef.current?.focus();
      return;
    }

    if (trimmedName.length > 100) {
      toast.warning("ชื่อประเภทอาหารต้องไม่เกิน 100 ตัวอักษร");
      nameInputRef.current?.focus();
      return;
    }

    if (trimmedRemark.length > 500) {
      toast.warning("หมายเหตุต้องไม่เกิน 500 ตัวอักษร");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: trimmedName,
        remark: trimmedRemark,
        id: id,
      };

      if (id === 0) {
        await axiosInstance.post('/api/food-type/create', payload);
        toast.success("เพิ่มประเภทอาหารสำเร็จ");
      } else {
        await axiosInstance.put(`/api/food-type/update/${id}`, payload);
        toast.success("แก้ไขประเภทอาหารสำเร็จ");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsModalOpen(false);
      clearForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await axiosInstance.delete(`/api/food-type/delete/${deleteId}`);
      toast.success("ลบประเภทอาหารสำเร็จ");
      fetchData();
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      setFoodCount(0);
      setDeleteFoodTypeName("");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteClick = async (foodType: FoodType) => {
    setDeleteId(foodType.id);
    setDeleteFoodTypeName(foodType.name);
    setIsDeleteDialogOpen(true);
    const count = await checkFoodCount(foodType.id);
    setFoodCount(count);
  };

  const editFoodType = (foodType: FoodType) => {
    setId(foodType.id);
    setName(foodType.name);
    setRemark(foodType.remark || "");
    setIsModalOpen(true);
  };

  const clearForm = () => {
    setId(0);
    setName("");
    setRemark("");
  };

  const openAddModal = () => {
    clearForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            จัดการประเภทอาหาร
          </h1>
          <p className="text-muted-foreground mt-1">
            เพิ่ม แก้ไข หรือลบประเภทอาหาร
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isFetching}
            className="gap-2"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
          <Button onClick={openAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มประเภทอาหาร
          </Button>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        id="modalFoodType"
        title={id === 0 ? "เพิ่มประเภทอาหาร" : "แก้ไขประเภทอาหาร"}
        modalSize="md"
        description="กรุณากรอกข้อมูลประเภทอาหาร"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              ชื่อประเภทอาหาร <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({name.length}/100)
              </span>
            </label>
            <Input
              ref={nameInputRef}
              id="name"
              value={name}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setName(e.target.value);
                }
              }}
              placeholder="กรุณากรอกชื่อประเภทอาหาร"
              disabled={isLoading}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="remark" className="text-sm font-medium">
              หมายเหตุ
              <span className="text-xs text-muted-foreground ml-2">
                ({remark.length}/500)
              </span>
            </label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setRemark(e.target.value);
                }
              }}
              placeholder="กรุณากรอกหมายเหตุ (ถ้ามี)"
              rows={3}
              disabled={isLoading}
              maxLength={500}
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

      {/* Search Bar */}
      {foodTypes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหาประเภทอาหาร (ชื่อ หรือ หมายเหตุ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการประเภทอาหาร</CardTitle>
          <CardDescription>
            {searchQuery.trim() === ""
              ? `รายการประเภทอาหารทั้งหมด ${foodTypes.length} รายการ`
              : `พบ ${filteredFoodTypes.length} รายการ จากทั้งหมด ${foodTypes.length} รายการ`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foodTypes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>ยังไม่มีข้อมูลประเภทอาหาร</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มประเภทอาหาร" เพื่อเพิ่มข้อมูล
              </p>
            </div>
          ) : (
            <>
              {filteredFoodTypes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>ไม่พบข้อมูลที่ค้นหา</p>
                  <p className="text-sm mt-2">
                    ลองค้นหาด้วยคำอื่น หรือ{" "}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-primary hover:underline"
                    >
                      ล้างการค้นหา
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {filteredFoodTypes.map((foodType, index) => {
                      const originalIndex = foodTypes.findIndex((ft) => ft.id === foodType.id);
                      return (
                  <Card key={foodType.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="shrink-0">
                              #{originalIndex + 1}
                            </Badge>
                            <h3 className="font-semibold text-base truncate">{foodType.name}</h3>
                          </div>
                          {foodType.remark && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {foodType.remark}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editFoodType(foodType)}
                            className="h-8 w-8"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(foodType)}
                            className="h-8 w-8"
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ลำดับ</TableHead>
                          <TableHead>ชื่อประเภทอาหาร</TableHead>
                          <TableHead>หมายเหตุ</TableHead>
                          <TableHead className="w-[150px] text-right">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFoodTypes.map((foodType) => {
                          const originalIndex = foodTypes.findIndex((ft) => ft.id === foodType.id);
                          return (
                            <TableRow key={foodType.id}>
                              <TableCell>
                                <Badge variant="outline">{originalIndex + 1}</Badge>
                              </TableCell>
                        <TableCell className="font-semibold text-base">
                          {foodType.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {foodType.remark || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editFoodType(foodType)}
                              className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                              title="แก้ไข"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteClick(foodType)}
                              className="h-9 w-9 hover:bg-destructive/90 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบประเภทอาหาร "{deleteFoodTypeName}"
              หรือไม่?
              <br />
              {foodCount > 0 && (
                <>
                  <span className="text-destructive font-semibold">
                    ⚠️ มีอาหารที่ใช้ประเภทนี้อยู่ {foodCount} รายการ
                  </span>
                  <br />
                </>
              )}
              การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteId(null);
                setFoodCount(0);
                setDeleteFoodTypeName("");
              }}
            >
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
  );
};

export default FoodTypePage;

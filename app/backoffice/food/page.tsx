// Food Management Page
"use client";
import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/lib/config';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/shared/Mymodal";
import type { FoodType, Food, ApiResponse } from "@/types/api";
import { AxiosError } from "axios";

const FoodPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [foodTypeId, setFoodTypeId] = useState<number>(0);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [id, setId] = useState(0);
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [myFile, setMyFile] = useState<File | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [FoodType, setFoodType] = useState("food");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  
  useEffect(() => {
    fetchDataFoodType();
    fetchDataFood();
  }, []);

  const fetchDataFoodType = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse<FoodType[]>>('/api/food-type/list');
      
      if (response.data.result && response.data.result.length > 0) {
        setFoodTypes(response.data.result);
        setFoodTypeId(response.data.result[0].id);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทอาหาร");
    }
  }

  const fetchDataFood = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse<Food[]>>('/api/food/list');
      setFoods(response.data.result || []);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลอาหาร");
    }
  }
  
  const handleUploadImage = async () => {
    if (!myFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("myFile", myFile);

    try {
      const response = await axiosInstance.post<{ fileName: string }>('/api/food/upload-image', formData);
      
      return response.data.fileName;

    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      return null;
    }
  }

  const handleSelectedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMyFile(e.target.files[0]);
    }
  }

  const clearForm = () => {
    setId(0);
    setName("");
    setRemark("");
    setPrice(0);
    setImg("");
    setMyFile(null);
    setFoodTypeId(foodTypes.length > 0 ? foodTypes[0].id : 0);
    setFoodType("food");
  }

  const openAddModal = () => {
    clearForm();
    setIsModalOpen(true);
  }

  const handleSave = async () => {
    try {
      if (id === 0 && !myFile) {
        toast.warning("กรุณาเลือกรูปภาพ");
        return;
      }

      setIsLoading(true);
      const uploadImage = await handleUploadImage();
      const finalImg = uploadImage ?? img;

      if (id === 0 && !finalImg) {
        toast.warning("กรุณาเลือกรูปภาพ");
        setIsLoading(false);
        return;
      }
      const payload = {
        id: id,
        name: name.trim(),
        remark: remark.trim(),
        price: price,
        img: finalImg,
        foodType: FoodType,
        foodTypeId: foodTypeId,
      }

      if (id === 0) {
        await axiosInstance.post('/api/food/create', payload);
        toast.success("บันทึกข้อมูลอาหารสำเร็จ");
      } else {
        await axiosInstance.put(`/api/food/update/${id}`, payload);
        toast.success("แก้ไขข้อมูลอาหารสำเร็จ");
      }
      fetchDataFood();
      clearForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลอาหาร");
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(`/api/food/delete/${deleteId}`);
      toast.success("ลบข้อมูลอาหารสำเร็จ");
      fetchDataFood();
      setDeleteId(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูลอาหาร");
    }
  }
  
  const editFood = (food: Food) => {
    setId(food.id);
    setName(food.name);
    setRemark(food.remark || "");
    setPrice(food.price);
    setImg(food.img || "");
    setFoodTypeId(food.foodTypeId);
    setFoodType(food.foodType);
    setMyFile(null);
    setIsModalOpen(true);
  }

  const getFoodTypeName = (foodType: string) => {
    return foodType === "food" ? "อาหาร" : foodType === "drink" ? "เครื่องดื่ม" : "";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการอาหาร</h1>
          <p className="text-muted-foreground mt-1">
            เพิ่ม แก้ไข หรือลบอาหาร
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        id="modalFood"
        title={id === 0 ? "เพิ่มอาหาร" : "แก้ไขอาหาร"}
        modalSize="lg"
        description="กรุณากรอกข้อมูลอาหาร"
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
            <label htmlFor="image" className="text-sm font-medium">
              ภาพ <span className="text-destructive">*</span>
            </label>
            {img !== "" && (
              <div className="mb-3 flex justify-center">
                <img
                  className="rounded-lg border-2 border-gray-200 object-contain bg-gray-50 p-2 max-h-32"
                  src={getImageUrl(`uploads/${img}`)}
                  alt={name}
                />
              </div>
            )}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleSelectedFile}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              ชื่ออาหาร <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรุณากรอกชื่ออาหาร"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="remark" className="text-sm font-medium">
              หมายเหตุ
            </label>
            <Input
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="กรุณากรอกหมายเหตุ (ถ้ามี)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              ราคา <span className="text-destructive">*</span>
            </label>
            <Input
              id="price"
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              ชนิด <span className="text-destructive">*</span>
            </label>
            <RadioGroup
              value={FoodType}
              onValueChange={setFoodType}
              disabled={isLoading}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="food" id="food" />
                <Label htmlFor="food" className="cursor-pointer">
                  อาหาร
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="drink" id="drink" />
                <Label htmlFor="drink" className="cursor-pointer">
                  เครื่องดื่ม
                </Label>
              </div>
            </RadioGroup>
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
          <CardTitle>รายการอาหาร</CardTitle>
          <CardDescription>
            รายการอาหารทั้งหมด {foods.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>ยังไม่มีข้อมูลอาหาร</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มรายการ" เพื่อเพิ่มข้อมูล
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {foods.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <img
                            src={getImageUrl(`uploads/${item.img}`)}
                            alt={item.name}
                            className="w-24 h-24 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary hover:shadow-md transition-all bg-gray-50 p-1"
                            onClick={() => setSelectedImage({ 
                              src: getImageUrl(`uploads/${item.img}`), 
                              alt: item.name 
                            })}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-base truncate">{item.name}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => editFood(item)}
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
                                    onClick={() => setDeleteId(item.id)}
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
                                      คุณต้องการลบอาหาร "{item.name}" หรือไม่?
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
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="font-medium text-xs">
                              {item.FoodType?.name || "-"}
                            </Badge>
                            <Badge 
                              variant={item.foodType === "food" ? "default" : "secondary"}
                              className="font-medium text-xs"
                            >
                              {getFoodTypeName(item.foodType)}
                            </Badge>
                          </div>
                          {item.remark && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {item.remark}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className="font-semibold text-lg text-primary">
                              {item.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">บาท</span>
                          </div>
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
                      <TableHead className="w-[100px] text-center">ภาพ</TableHead>
                      <TableHead className="w-[150px]">ประเภท</TableHead>
                      <TableHead className="w-[120px]">ชนิด</TableHead>
                      <TableHead>ชื่ออาหาร</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                      <TableHead className="w-[120px] text-right">ราคา</TableHead>
                      <TableHead className="w-[130px] text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foods.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <img
                              src={getImageUrl(`uploads/${item.img}`)}
                              alt={item.name}
                              className="w-20 h-20 object-contain rounded-lg  cursor-pointer hover:border-primary hover:shadow-md transition-all bg-gray-50 p-1"
                              onClick={() => setSelectedImage({ 
                                src: getImageUrl(`uploads/${item.img}`), 
                                alt: item.name 
                              })}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {item.FoodType?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.foodType === "food" ? "default" : "secondary"}
                            className="font-medium"
                          >
                            {getFoodTypeName(item.foodType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-base">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {item.remark || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-lg text-primary">
                            {item.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">บาท</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editFood(item)}
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
                                  onClick={() => setDeleteId(item.id)}
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
                                    คุณต้องการลบอาหาร "{item.name}" หรือไม่?
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

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.alt}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-4">{selectedImage.alt}</p>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FoodPage


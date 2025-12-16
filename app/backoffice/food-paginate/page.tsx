// Food Paginate Page
"use client";

import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { getImageUrl } from '@/lib/config';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Food, FoodType, ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

const FoodPaginatePage = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Fetch data automatically only on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch data when page or limit changes
    if (!isFirstLoad.current) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post('/api/food/paginate', {
        page: currentPage,
        limit: limit,
      });

      setFoods(res.data.result || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalItems(res.data.totalItems || 0);
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
      await axiosInstance.delete(`/api/food-paginate/delete/${deleteId}`);
      
      toast.success("ลบข้อมูลอาหารสำเร็จ");
      setDeleteId(null);
      
      // If current page becomes empty after deletion, go to previous page
      if (foods.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);  
      } else {
        fetchData();
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: getErrorMessage(error),
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const getFoodTypeName = (foodType: string) => {
    return foodType === "food" ? "อาหาร" : foodType === "drink" ? "เครื่องดื่ม" : "";
  };


  // Calculate pagination info
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">อาหารแบบ Pagination</h1>
          <p className="text-muted-foreground mt-1">
            จัดการอาหารแบบแบ่งหน้า ({totalItems} รายการ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="limit" className="text-sm whitespace-nowrap">แสดงต่อหน้า:</Label>
          <Select
            value={limit.toString()}
            onValueChange={(value) => handleLimitChange(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger id="limit" className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Food Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการอาหาร</CardTitle>
          <CardDescription>
            แสดง {startItem}-{endItem} จาก {totalItems} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-base">ยังไม่มีข้อมูลอาหาร</p>
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
                                className="h-8 w-8"
                                title="ดูรูปภาพ"
                                onClick={() => setSelectedImage({ 
                                  src: getImageUrl(`uploads/${item.img}`), 
                                  alt: item.name 
                                })}
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
                              ฿{item.price.toLocaleString("th-TH")}
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
                              className="w-20 h-20 object-contain rounded-lg cursor-pointer hover:border-primary hover:shadow-md transition-all bg-gray-50 p-1 border-2 border-gray-200"
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
                            ฿{item.price.toLocaleString("th-TH")}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">บาท</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedImage({ 
                                src: getImageUrl(`uploads/${item.img}`), 
                                alt: item.name 
                              })}
                              className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                              title="ดูรูปภาพ"
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

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                แสดง {startItem}-{endItem} จาก {totalItems} รายการ
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isLoading}
                  title="หน้าแรก"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  title="หน้าก่อน"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  title="หน้าถัดไป"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                  title="หน้าสุดท้าย"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบอาหารนี้หรือไม่?
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
  );
};

export default FoodPaginatePage;

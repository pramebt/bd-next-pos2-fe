// Taste Page
"use client";
import Modal from '@/components/shared/Mymodal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface TasteProps {
  id: number;
  name: string;
  remark: string;
  foodTypeId: number;
  FoodType?: {
    id: number;
    name: string;
  };
}

interface FoodTypeProps {
  id: number;
  name: string;
  remark: string;
}

const TastePage = () => {
    const [foodTypes, setFoodTypes] = useState<FoodTypeProps[]>([]);
    const [foodTypeId, setFoodTypeId] = useState<number>(0);
    const [tastes, setTastes] = useState<TasteProps[]>([]);
    const [name, setName] = useState("");
    const [id, setId] = useState(0);
    const [remark, setRemark] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        fetchDataTaste();
        fetchDataFoodType();
    }, []);

    const fetchDataTaste = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const response = await axios.get(`${apiUrl}/api/taste/list`);
            setTastes(response.data.result || []);
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลรสชาติ", {
                description: error.message || "ไม่สามารถโหลดข้อมูลได้",
            });
        }
    }

    const fetchDataFoodType = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const response = await axios.get(`${apiUrl}/api/food-type/list`);
            if (response.data.result.length > 0) {
                setFoodTypes(response.data.result);
                setFoodTypeId(response.data.result[0].id);
            }
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทอาหาร")
        }
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.warning("กรุณากรอกชื่อรสชาติ");
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
                id: id,
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            if (id === 0) {
                await axios.post(`${apiUrl}/api/taste/create`, payload);
            } else {
                await axios.post(`${apiUrl}/api/taste/update`, payload);
            }
            toast.success("บันทึกข้อมูลรสชาติสำเร็จ");
            fetchDataTaste();
            clearForm();
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลรสชาติ")
        } finally {
            setIsLoading(false);
        }
    }
     
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            await axios.post(`${apiUrl}/api/taste/delete`, { id: deleteId });
        
        toast.success("ลบข้อมูลรสชาติสำเร็จ");
        fetchDataTaste();
        setDeleteId(null);
    } catch (error: any) {
        toast.error("เกิดข้อผิดพลาดในการลบข้อมูลรสชาติ")
    }

    }

    const editTaste = (taste: TasteProps) => {
        setId(taste.id);
        setName(taste.name);
        setRemark(taste.remark || "");
        setFoodTypeId(taste.foodTypeId);
        setIsModalOpen(true);
    }
    const clearForm = () => {
        setId(0);
        setName("");
        setRemark("");
        setFoodTypeId(0);
    }
    
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
            จัดการรสชาติอาหาร
          </h1>
          <p className="text-muted-foreground mt-1">
            เพิ่ม แก้ไข หรือลบรสชาติอาหาร
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรสชาติอาหาร
        </Button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        id="modalTaste"
        title={id === 0 ? "เพิ่มรสชาติอาหาร" : "แก้ไขรสชาติอาหาร"}
        modalSize="md"
        description="กรุณากรอกข้อมูลรสชาติอาหาร"
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
              onValueChange={(value) => setFoodTypeId(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger id="foodType">
                <SelectValue placeholder="กรุณาเลือกประเภทอาหาร" />
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
              ชื่อรสชาติอาหาร <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรุณากรอกชื่อรสชาติอาหาร"
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
          <CardTitle>รายการรสชาติอาหาร</CardTitle>
          <CardDescription>
            รายการรสชาติอาหารทั้งหมด {tastes.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tastes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>ยังไม่มีข้อมูลรสชาติอาหาร</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มรสชาติอาหาร" เพื่อเพิ่มข้อมูล
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {tastes.map((taste, index) => (
                  <Card key={taste.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="shrink-0">
                              #{index + 1}
                            </Badge>
                            <Badge variant="secondary" className="shrink-0">
                              {taste.FoodType?.name || "-"}
                            </Badge>
                            <h3 className="font-semibold text-base truncate">{taste.name}</h3>
                          </div>
                          {taste.remark && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {taste.remark}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editTaste(taste)}
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
                                onClick={() => setDeleteId(taste.id)}
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
                                  คุณต้องการลบรสชาติอาหาร "{taste.name}"
                                  หรือไม่?
                                  <br />
                                  การกระทำนี้ไม่สามารถยกเลิกได้
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeleteId(null)}
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
                      <TableHead>ชื่อรสชาติอาหาร</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                      <TableHead className="w-[150px] text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tastes.map((taste, index) => (
                      <TableRow key={taste.id}>
                        <TableCell>
                          <Badge variant="outline">{index + 1}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {taste.FoodType?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-base">
                          {taste.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {taste.remark || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editTaste(taste)}
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
                                  onClick={() => setDeleteId(taste.id)}
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
                                    คุณต้องการลบรสชาติอาหาร "{taste.name}"
                                    หรือไม่?
                                    <br />
                                    การกระทำนี้ไม่สามารถยกเลิกได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeleteId(null)}
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
  )
}

export default TastePage



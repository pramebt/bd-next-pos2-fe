// Food Type Page
"use client";
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import Modal from '@/components/shared/Mymodal';

interface FoodTypeProps {
    id: number;
    name: string;
    remark: string;
}

const FoodTypePage = () => {
    const [id, setId] = useState(0);
    const [name, setName] = useState("");
    const [remark, setRemark] = useState("");
    const [foodTypes, setFoodTypes] = useState<FoodTypeProps[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const response = await axios.get(`${apiUrl}/api/food-type/list`);
            setFoodTypes(response.data.result || []);
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", {
                description: error.message || "ไม่สามารถโหลดข้อมูลประเภทอาหารได้",
            });
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.warning("กรุณากรอกชื่อประเภทอาหาร");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name: name.trim(),
                remark: remark.trim(),
                id: id
            };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            
            if (id === 0) {
                await axios.post(`${apiUrl}/api/food-type/create`, payload);
                toast.success("เพิ่มประเภทอาหารสำเร็จ");
            } else {
                await axios.post(`${apiUrl}/api/food-type/update`, payload);
                toast.success("แก้ไขประเภทอาหารสำเร็จ");
            }
            
            fetchData();
            clearForm();
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาด", {
                description: error.response?.data?.message || error.message || "ไม่สามารถบันทึกข้อมูลได้",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            await axios.post(`${apiUrl}/api/food-type/delete`, { id: deleteId });
            toast.success("ลบประเภทอาหารสำเร็จ");
            fetchData();
            setDeleteId(null);
        } catch (error: any) {
            toast.error("เกิดข้อผิดพลาด", {
                description: error.response?.data?.message || error.message || "ไม่สามารถลบข้อมูลได้",
            });
        }
    };

    const editFoodType = (foodType: FoodTypeProps) => {
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
                    <h1 className="text-3xl font-bold text-foreground">จัดการประเภทอาหาร</h1>
                    <p className="text-muted-foreground mt-1">
                        เพิ่ม แก้ไข หรือลบประเภทอาหาร
                    </p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    เพิ่มประเภทอาหาร
                </Button>
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
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            ชื่อประเภทอาหาร <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="กรุณากรอกชื่อประเภทอาหาร"
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
                    <CardTitle>รายการประเภทอาหาร</CardTitle>
                    <CardDescription>
                        รายการประเภทอาหารทั้งหมด {foodTypes.length} รายการ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {foodTypes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>ยังไม่มีข้อมูลประเภทอาหาร</p>
                            <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มประเภทอาหาร" เพื่อเพิ่มข้อมูล</p>
                        </div>
                    ) : (
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
                                {foodTypes.map((foodType, index) => (
                                    <TableRow key={foodType.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{foodType.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {foodType.remark || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => editFoodType(foodType)}
                                                    className="h-8 w-8"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => setDeleteId(foodType.id)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                คุณต้องการลบประเภทอาหาร "{foodType.name}" หรือไม่?
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FoodTypePage;

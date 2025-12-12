// User Management Page
"use client";
import axiosInstance from '@/lib/axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, User, Shield, UserCog } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/shared/Mymodal";

interface UserProps {
  id: number;
  name: string;
  username: string;
  password: string;
  level: 'admin' | 'user';
}

const UserPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState<'admin' | 'user'>('user');
  const [id, setId] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchDataUsers();
  }, []);

  const fetchDataUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axiosInstance.get(`${apiUrl}/api/user/get-users`);
      setUsers(response.data.results || []);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    }
  }

  const clearForm = () => {
    setId(0);
    setName("");
    setUsername("");
    setPassword("");
    setLevel('user');
  }

  const openAddModal = () => {
    clearForm();
    setIsModalOpen(true);
  }

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        toast.warning("กรุณากรอกชื่อ");
        return;
      }
      if (!username.trim()) {
        toast.warning("กรุณากรอกชื่อผู้ใช้");
        return;
      }
      if (id === 0 && !password.trim()) {
        toast.warning("กรุณากรอกรหัสผ่าน");
        return;
      }

      setIsLoading(true);
      const payload: {
        name: string;
        username: string;
        password?: string;
        level: 'admin' | 'user';
      } = {
        name: name.trim(),
        username: username.trim(),
        level: level,
      };

      // Only include password if it's provided (for new user or when updating)
      if (password.trim()) {
        payload.password = password.trim();
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      if (id === 0) {
        await axiosInstance.post(`${apiUrl}/api/user/signup`, payload);
        toast.success("บันทึกข้อมูลผู้ใช้สำเร็จ");
      } else {
        await axiosInstance.put(`${apiUrl}/api/user/update-user/${id}`, payload);
        toast.success("แก้ไขข้อมูลผู้ใช้สำเร็จ");
      }
      fetchDataUsers();
      clearForm();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้");
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axiosInstance.delete(`${apiUrl}/api/user/delete-user/${deleteId}`);
      toast.success("ลบข้อมูลผู้ใช้สำเร็จ");
      fetchDataUsers();
      setDeleteId(null);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้");
    }
  }
  
  const editUser = (user: UserProps) => {
    setId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(""); // ไม่แสดงรหัสผ่านเดิมเพื่อความปลอดภัย
    setLevel(user.level);
    setIsModalOpen(true);
  }

  const getLevelLabel = (level: string) => {
    return level === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน";
  }

  const getLevelIcon = (level: string) => {
    return level === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการผู้ใช้</h1>
          <p className="text-muted-foreground mt-1">
            เพิ่ม แก้ไข หรือลบผู้ใช้งาน
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        id="modalUser"
        title={id === 0 ? "เพิ่มผู้ใช้" : "แก้ไขผู้ใช้"}
        modalSize="md"
        description="กรุณากรอกข้อมูลผู้ใช้"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              ชื่อ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรุณากรอกชื่อ"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              ชื่อผู้ใช้ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              รหัสผ่าน {id === 0 && <span className="text-destructive">*</span>}
              {id > 0 && <span className="text-muted-foreground text-xs ml-2">(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={id === 0 ? "กรุณากรอกรหัสผ่าน" : "กรุณากรอกรหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)"}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">
              ระดับผู้ใช้งาน <span className="text-destructive">*</span>
            </Label>
            <Select
              value={level}
              onValueChange={(value) => setLevel(value as 'admin' | 'user')}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกระดับผู้ใช้งาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    ผู้ดูแลระบบ
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    ผู้ใช้งาน
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
          <CardTitle>รายการผู้ใช้</CardTitle>
          <CardDescription>
            รายการผู้ใช้ทั้งหมด {users.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีข้อมูลผู้ใช้</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มผู้ใช้" เพื่อเพิ่มข้อมูล
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {users.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            @{item.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editUser(item)}
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
                                  คุณต้องการลบผู้ใช้ "{item.name}" หรือไม่?
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
                      <div className="mt-3">
                        <Badge 
                          variant={item.level === "admin" ? "default" : "secondary"}
                          className="font-medium text-xs gap-1"
                        >
                          {getLevelIcon(item.level)}
                          {getLevelLabel(item.level)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>ชื่อผู้ใช้</TableHead>
                      <TableHead>ระดับผู้ใช้งาน</TableHead>
                      <TableHead className="text-right w-[120px]">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">@{item.username}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.level === "admin" ? "default" : "secondary"}
                            className="font-medium text-xs gap-1"
                          >
                            {getLevelIcon(item.level)}
                            {getLevelLabel(item.level)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editUser(item)}
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
                                    คุณต้องการลบผู้ใช้ "{item.name}" หรือไม่?
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

export default UserPage;

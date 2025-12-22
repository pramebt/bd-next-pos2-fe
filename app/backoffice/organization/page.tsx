// Organization Page
"use client";

import axiosInstance from '@/lib/axios';
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getImageUrl } from "@/lib/config";
import type { Organization, ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

const OrganizationPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [promptpay, setPromptpay] = useState("");
  const [logo, setLogo] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!fileSelected) {
      throw new Error("ไม่มีไฟล์ที่เลือก");
    }

    const formData = new FormData();
    formData.append("myFile", fileSelected);

    try {
      const response = await axiosInstance.post(
        '/api/organization/upload-file',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setLogo(response.data.fileName);
      return response.data.fileName;
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
        description: getErrorMessage(error),
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse<Organization>>('/api/organization/info');

      if (response.data.result) {
        setName(response.data.result.name || "");
        setPhone(response.data.result.phone || "");
        setAddress(response.data.result.address || "");
        setEmail(response.data.result.email || "");
        setWebsite(response.data.result.website || "");
        setPromptpay(response.data.result.promptpay || "");
        setLogo(response.data.result.logo || "");
        setTaxCode(response.data.result.taxCode || "");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (
        !name.trim() ||
        !phone.trim() ||
        !promptpay.trim() ||
        !website.trim() ||
        !taxCode.trim() ||
        !address.trim() ||
        !email.trim()
      ) {
        toast.warning("กรุณากรอกข้อมูลให้ครบ");
        setIsLoading(false);
        return;
      }

      let finalLogo = logo;
      if (fileSelected) {
        try {
          finalLogo = await uploadFile();
        } catch (error) {
          // Error already handled in uploadFile
          setIsLoading(false);
          return;
        }
      }
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        website: website.trim(),
        promptpay: promptpay.trim(),
        logo: finalLogo,
        taxCode: taxCode.trim(),
      };

      await axiosInstance.post('/api/organization/create', payload);
      toast.success("บันทึกข้อมูลสำเร็จ");
      fetchData();
      setFileSelected(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ข้อมูลร้าน</h1>
          <p className="text-muted-foreground mt-1">
            จัดการข้อมูลร้านค้าและข้อมูลติดต่อ
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            ข้อมูลร้านค้า
          </CardTitle>
          <CardDescription>กรุณากรอกข้อมูลร้านค้าให้ครบถ้วน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="logo">
                โลโก้ร้าน <span className="text-destructive">*</span>
              </Label>

              {/* Current Logo */}
              {logo && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(logo)}
                      alt="Logo"
                      className="rounded-lg border-2 border-gray-200 object-contain bg-gray-50 p-2 max-h-32"
                    />
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium text-foreground">
                      โลโก้ปัจจุบัน:
                    </p>
                    <p className="text-sm text-muted-foreground break-all">
                      {logo}
                    </p>
                  </div>
                </div>
              )}

              {/* New File Selected */}
              {fileSelected && (
                <div className="rounded-md bg-primary/10 p-3 border border-primary/20 mb-3">
                  <p className="text-sm font-medium text-primary">
                    ไฟล์ที่เลือกใหม่:
                  </p>
                  <p className="text-sm text-primary/80 break-all">
                    {fileSelected.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(fileSelected.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {!logo && !fileSelected && (
                <div className="rounded-md bg-muted p-3 mb-3">
                  <p className="text-sm text-muted-foreground">ยังไม่มีโลโก้</p>
                </div>
              )}

              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                รองรับไฟล์รูปภาพ (JPG, PNG, GIF)
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                ชื่อร้าน <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรุณากรอกชื่อร้าน"
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                เบอร์โทรศัพท์ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                disabled={isLoading}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                ที่อยู่ <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="กรุณากรอกที่อยู่"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                อีเมล <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรุณากรอกอีเมล"
                disabled={isLoading}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">
                เว็บไซต์ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>

            {/* PromptPay */}
            <div className="space-y-2">
              <Label htmlFor="promptpay">
                PromptPay <span className="text-destructive">*</span>
              </Label>
              <Input
                id="promptpay"
                value={promptpay}
                onChange={(e) => setPromptpay(e.target.value)}
                placeholder="กรุณากรอกหมายเลข PromptPay"
                disabled={isLoading}
              />
            </div>

            {/* Tax Code */}
            <div className="space-y-2">
              <Label htmlFor="taxCode">
                รหัสภาษี <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taxCode"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="กรุณากรอกรหัสภาษี"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="gap-2 min-w-32"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    บันทึกข้อมูล
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationPage;

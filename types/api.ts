// API Response Types

// ==================== Common Types ====================

export type UserLevel = 'admin' | 'user';
export type UserStatus = 'use' | 'delete';
export type FoodTypeEnum = 'food' | 'drink';
export type PayType = 'cash' | 'promptpay' | 'transfer';

// ==================== API Response Wrappers ====================

export interface ApiResponse<T> {
  result?: T;
  results?: T;
  message?: string;
  totalPages?: number;
  totalItems?: number;
}

// ==================== User Types ====================

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  name: string;
  id: number;
  level: UserLevel;
}

export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  level: UserLevel;
  status?: UserStatus;
}

// ==================== Food Types ====================

export interface FoodType {
  id: number;
  name: string;
  remark: string;
  status?: string;
}

export interface Food {
  id: number;
  name: string;
  remark: string;
  price: number;
  img: string;
  foodType: FoodTypeEnum;
  foodTypeId: number;
  FoodType?: FoodType;
  status?: string;
}

export interface FoodSize {
  id: number;
  name: string;
  remark: string;
  foodTypeId: number;
  moneyAdded: number;
  status?: string;
  FoodType?: FoodType;
}

export interface Taste {
  id: number;
  name: string;
  remark: string;
  foodTypeId: number;
  status?: string;
  FoodType?: FoodType;
}

// ==================== Sale Types ====================

export interface SaleTemp {
  id: number;
  userId: number;
  tableNo: number;
  foodId: number;
  qty: number;
  Food: Food;
  SaleTempDetails?: SaleTempDetail[];
}

export interface SaleTempDetail {
  id: number;
  saleTempId: number;
  foodId: number;
  tasteId?: number;
  foodSizeId?: number;
  Food: Food;
  FoodSize?: FoodSize;
  Taste?: Taste;
  SaleTemp?: SaleTemp;
}

export interface SaleTempInfo {
  id: number;
  userId: number;
  tableNo: number;
  foodId: number;
  qty: number;
  Food: Food & {
    FoodType?: FoodType & {
      Tastes?: Taste[];
      FoodSizes?: FoodSize[];
    };
  };
  SaleTempDetails?: SaleTempDetail[];
}

// ==================== Bill Sale Types ====================

export interface BillSale {
  id: number;
  createdDate: string;
  payDate: string;
  amount: number;
  payType: PayType;
  userId: number;
  inputMoney: number;
  returnMoney: number;
  tableNo: number;
  status: string;
  User: {
    id: number;
    name: string;
  };
  BillSaleDetails?: BillSaleDetail[];
}

export interface BillSaleDetail {
  id: number;
  billSaleId: number;
  foodId: number;
  tasteId?: number;
  foodSizeId?: number;
  moneyAdded?: number;
  price?: number;
  Food: Food;
  FoodSize?: FoodSize;
  Taste?: Taste;
}

// ==================== Organization Types ====================

export interface Organization {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  promptpay: string;
  logo: string;
  taxCode: string;
}

// ==================== Error Types ====================

export interface ApiError {
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}


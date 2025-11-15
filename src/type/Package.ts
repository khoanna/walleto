export interface Permission {
  permissionName: string;
  description: string;
}

export interface Package {
  idPackage: string;
  packageName: string;
  description: string;
  price: number;
  durationDays: number;
  createAt: string;
  bought: boolean;
  permissions: Permission[];
}

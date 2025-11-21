export interface Customer {
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orders: number;
  spent: number;
  status: 'active' | 'blocked';
  registrationDate: string;
  lastLogin?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

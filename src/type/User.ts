export default interface User {
  idUser: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null; // ✅ sửa: không còn literal type
  address: string | null;
  totalAmount: number;
  urlAvatar: string | null;
  createAt?: string;
}

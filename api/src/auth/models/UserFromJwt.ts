export interface UserFromJwt {
  id: number;
  email: string;
  name: string;
  level: string;
  status: string;
  master_id?: number;
}

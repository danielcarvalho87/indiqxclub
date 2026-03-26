export interface UserPayload {
  sub: number;
  email: string;
  name: string;
  level: string;
  status: string;
  master_id?: number;
  iet?: number;
  exp?: number;
}

import { neon } from "@neondatabase/serverless";

// DATABASE_URL은 Vercel ↔ NeonDB 연동 시 자동으로 주입됩니다
const sql = neon(process.env.DATABASE_URL!);

export default sql;

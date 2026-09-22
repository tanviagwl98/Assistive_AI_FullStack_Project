import { NextResponse } from "next/server";
export const dataResponse = <T>(data: T, init?: ResponseInit) => NextResponse.json({ data }, init);
export const successResponse = (init?: ResponseInit) => NextResponse.json({ success: true }, init);

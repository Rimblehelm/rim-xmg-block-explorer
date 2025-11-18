import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ address: string[] }> }
) {
	const { address } = await context.params;

	const normalized = Array.isArray(address) ? address.join("/") : address;

	return new NextResponse(normalized, { status: 200 });
}
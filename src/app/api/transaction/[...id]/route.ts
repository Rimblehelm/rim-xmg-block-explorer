import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string[] }> }
) {
	const { id } = await context.params;

	const normalized = Array.isArray(id) ? id.join("/") : id;

	return new NextResponse(normalized, { status: 200 });
}
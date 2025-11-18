import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	const params = await context.params;
	const id = params.id;

	return new NextResponse(id, { status: 200 });
}
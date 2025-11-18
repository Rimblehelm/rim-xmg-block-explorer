import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ address: string }> }
) {
	const params = await context.params;
	const address = params.address;

	return new NextResponse(address, { status: 200 });
}
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	context: { params: { id: string | string[] } }
) {
	const { id } = context.params;

	// For a catch-all route `[...id]`, Next provides `id` as string[] when
	// multiple segments are present. Normalize to a string for responses.
	const normalizedId = Array.isArray(id) ? id.join("/") : id;

	return new NextResponse(normalizedId, { status: 200 });
}
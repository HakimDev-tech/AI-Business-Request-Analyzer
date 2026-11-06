import { NextResponse } from "next/server";
import { z } from "zod";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { documentInputSchema } from "@/schemas/request.schema";
import { ingestDocument } from "@/rag/ingest";
import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET() {
  try {
    const result = await getDb().query(
      "SELECT id,title,source_type,status,chunk_count,created_at FROM catalog_documents WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 50",
      [getEnv().WORKSPACE_ID],
    );
    return NextResponse.json({ success: true, documents: result.rows });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let title: string;
    let content: string;
    let sourceType: string;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ success: false, error: "A document file is required" }, { status: 400 });
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, error: "Maximum document size is 10 MB" }, { status: 413 });
      title = String(form.get("title") || file.name).slice(0, 180);
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const buffer = Buffer.from(await file.arrayBuffer());

      if (["txt", "md", "csv", "json"].includes(extension)) {
        content = buffer.toString("utf8");
        sourceType = extension === "csv" ? "csv" : extension === "json" ? "json" : "text";
      } else if (extension === "pdf") {
        const parsed = await pdf(buffer);
        content = parsed.text;
        sourceType = "pdf";
      } else if (extension === "docx") {
        const parsed = await mammoth.extractRawText({ buffer });
        content = parsed.value;
        sourceType = "docx";
      } else {
        return NextResponse.json({ success: false, error: "Supported formats: TXT, MD, CSV, JSON, PDF, DOCX" }, { status: 415 });
      }
    } else {
      const input = documentInputSchema.parse(await request.json());
      title = input.title;
      content = input.content;
      sourceType = input.sourceType;
    }

    if (content.trim().length < 20) {
      return NextResponse.json({ success: false, error: "The document contains too little extractable text" }, { status: 422 });
    }
    const result = await ingestDocument(title, content, sourceType);
    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: "Invalid document", details: error.issues }, { status: 400 });
    console.error("Document ingestion failed:", error);
    return NextResponse.json({ success: false, error: "Document extraction or indexing failed" }, { status: 500 });
  }
}
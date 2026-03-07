import { NextResponse } from 'next/server';
// We'll use a mock QR for the demo if the real one isn't ready
// Real implementation would use whatsapp-web.js event 'qr'

export async function GET() {
    // Simulación de generador de QR para vinculación
    const mockQr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EliteSalesOSLink";
    return NextResponse.json({ qr: mockQr });
}

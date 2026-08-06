import { NextResponse } from 'next/server';
import { getQuotes } from '../../../lib/db';

export async function GET() {
  try {
    const quotes = await getQuotes();
    
    // Filtrar cotizaciones que tengan fecha de entrega establecida
    const scheduledQuotes = quotes.filter(q => q.event_date);
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ObiDobi//Calendar Feed//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Entregas Obi Dobi',
      'X-WR-TIMEZONE:UTC',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H' // Sugerir actualización cada hora
    ];
    
    scheduledQuotes.forEach(q => {
      // event_date tiene formato YYYY-MM-DD
      const dateStr = q.event_date.replace(/-/g, '');
      const uid = q.id;
      
      // Sanitizar campos de texto para evitar problemas con comas y saltos de línea en iCal
      const summary = `Obi Dobi: Pedido #${q.folio} - ${q.client_name}`;
      const product = q.product_title || 'Pedido Personalizado';
      const quantity = q.quantity || 1;
      const client = q.client_name;
      const phone = q.client_phone || 'Sin número';
      const notes = q.notes ? q.notes.replace(/\r?\n/g, '\\n') : 'Ninguna';
      
      const description = `Producto: ${product} x${quantity}\\nCliente: ${client}\\nTeléfono: ${phone}\\nNotas: ${notes}`;
      
      // Fecha fin: el día siguiente para eventos de todo el día
      const startDate = new Date(q.event_date + 'T00:00:00');
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${uid}`);
      icsLines.push(`DTSTART;VALUE=DATE:${dateStr}`);
      icsLines.push(`DTEND;VALUE=DATE:${endDateStr}`);
      icsLines.push(`SUMMARY:${summary}`);
      icsLines.push(`DESCRIPTION:${description}`);
      icsLines.push('END:VEVENT');
    });
    
    icsLines.push('END:VCALENDAR');
    
    const responseText = icsLines.join('\r\n');
    
    return new NextResponse(responseText, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="entregas-obidobi.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error('Error generating calendar feed:', err);
    return new NextResponse('Error generating calendar feed', { status: 500 });
  }
}

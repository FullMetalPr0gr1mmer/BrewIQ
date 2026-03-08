import * as XLSX from 'xlsx';

export function exportChatsToXLSX(chatData, filename) {
  const rows = chatData.map((row) => ({
    'User Email': row.email,
    'Session ID': row.session_id,
    'Message Role': row.role,
    'Content': row.content,
    'Timestamp': row.created_at,
    'Satisfaction Rating': row.satisfaction_rating || 'N/A',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chat Logs');
  XLSX.writeFile(wb, filename || `brewiq-chats-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

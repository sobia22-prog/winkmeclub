import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { supportService } from '../../services/support.service';
import { SupportTicket, SupportMessage } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Headphones, MessageSquare, Send } from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Chat Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTickets({ status });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status]);

  const openTicketChat = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    try {
      const res = await supportService.getTicketDetails(ticket._id);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplyLoading(true);

    try {
      const res = await adminService.replyTicket(selectedTicket._id, { message: replyMessage });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.msg]);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reply failed.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-brand-wine" /> Concierge Customer Ticket Inbox
          </h1>
          <p className="text-xs text-slate-400">Respond to incoming VIP user support requests and inquiries.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'All Tickets', value: 'ALL' },
              { label: 'Open Tickets', value: 'OPEN' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Resolved', value: 'RESOLVED' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading support inbox...</Card>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No support tickets found for filter.</Card>
      ) : (
        <Table headers={['Ticket ID', 'User Name', 'Email', 'Category', 'Subject', 'Status', 'Action']}>
          {tickets.map((t) => (
            <tr key={t._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.ticketId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">{t.userName}</td>
              <td className="px-5 py-3 text-slate-400">{t.userEmail}</td>
              <td className="px-5 py-3 text-slate-300">{t.category}</td>
              <td className="px-5 py-3 text-slate-100 font-semibold max-w-xs truncate">{t.subject}</td>
              <td className="px-5 py-3">
                {t.status === 'OPEN' && <Badge variant="warning">OPEN</Badge>}
                {t.status === 'IN_PROGRESS' && <Badge variant="pending">IN PROGRESS</Badge>}
                {t.status === 'RESOLVED' && <Badge variant="success">RESOLVED</Badge>}
              </td>
              <td className="px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  onClick={() => openTicketChat(t)}
                >
                  Reply Chat
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Admin Conversation Reply Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket Inbox #${selectedTicket.ticketId} — ${selectedTicket.subject}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-brand-card border border-brand-border rounded-xl text-xs space-y-1">
              <div>User: <span className="font-bold text-slate-100">{selectedTicket.userName}</span> ({selectedTicket.userEmail})</div>
              <div>Category: <span className="text-slate-300">{selectedTicket.category}</span></div>
            </div>

            <div className="p-4 bg-brand-surface border border-brand-border rounded-xl space-y-3 max-h-72 overflow-y-auto">
              {messages.map((m) => (
                <div key={m._id} className={`flex flex-col ${m.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 font-bold mb-1">{m.senderName} ({m.senderRole})</span>
                  <div
                    className={`max-w-md p-3 rounded-xl text-xs ${
                      m.senderRole === 'ADMIN' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAdminReply} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Type official admin reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <Button type="submit" variant="gold" size="sm" isLoading={replyLoading} leftIcon={<Send className="w-3.5 h-3.5" />}>
                Send Reply
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

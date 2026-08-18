import React, { useState, useEffect } from 'react';
import { supportService } from '../../services/support.service';
import { SupportTicket, SupportMessage } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Badge } from '../../components/common/Badge';
import { Headphones, PlusCircle, MessageSquare, Send, User, ShieldCheck } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');

  // Create Ticket Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    category: 'VIP Membership & Verification',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await supportService.getMyTickets();
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketConversation = async (ticket: SupportTicket) => {
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await supportService.createTicket(createForm);
      if (res.data.success) {
        setShowCreateModal(false);
        setCreateForm({ category: 'VIP Membership & Verification', subject: '', message: '' });
        fetchTickets();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const res = await supportService.replyTicket(selectedTicket._id, replyMessage);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.supportMessage]);
        setReplyMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-brand-wine" /> Customer Concierge & Support
          </h1>
          <p className="text-xs text-slate-400">Open a support ticket or chat directly with our VIP concierge desk.</p>
        </div>

        <Button
          variant="primary"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => {
            setError('');
            setShowCreateModal(true);
          }}
        >
          New Support Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List Column */}
        <Card className="md:col-span-1 space-y-3 p-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Support Tickets</h3>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active support tickets.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => openTicketConversation(t)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTicket?._id === t._id
                      ? 'bg-brand-card border-brand-wine text-white shadow-lg'
                      : 'bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{t.ticketId}</span>
                    {t.status === 'OPEN' && <Badge variant="warning">OPEN</Badge>}
                    {t.status === 'IN_PROGRESS' && <Badge variant="pending">IN PROGRESS</Badge>}
                    {t.status === 'RESOLVED' && <Badge variant="success">RESOLVED</Badge>}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-1 truncate">{t.subject}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.category}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Conversation Chat Interface */}
        <Card className="md:col-span-2 flex flex-col justify-between min-h-[500px] p-0 overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket Top Header */}
              <div className="p-4 border-b border-brand-border bg-brand-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{selectedTicket.subject}</h3>
                    <Badge variant="neutral" size="sm">
                      {selectedTicket.ticketId}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Category: {selectedTicket.category}</p>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 max-h-[450px]">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${msg.senderRole === 'ADMIN' ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-slate-400">{msg.senderName}</span>
                      {msg.senderRole === 'ADMIN' && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold rounded">
                          CONCIERGE AGENT
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.senderRole === 'ADMIN'
                          ? 'bg-slate-800 text-slate-100 border border-slate-700'
                          : 'bg-brand-wine text-white'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-brand-border bg-brand-card flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message to support agent..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-wine"
                />
                <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
                  Send Reply
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Select a support ticket to view conversation</p>
              <p className="text-xs text-slate-500">Or create a new ticket using the button above.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Create Ticket Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Support Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

          <Select
            label="Category"
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            options={[
              { label: 'VIP Membership & Verification', value: 'VIP Membership & Verification' },
              { label: 'Recharge & Add Funds', value: 'Recharge & Add Funds' },
              { label: 'Withdrawal Request', value: 'Withdrawal Request' },
              { label: 'Trading & Products', value: 'Trading & Products' },
              { label: 'General Inquiry', value: 'General Inquiry' },
            ]}
          />

          <Input
            label="Subject"
            placeholder="Brief summary of your request"
            value={createForm.subject}
            onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
            required
          />

          <Textarea
            label="Detailed Description"
            placeholder="Describe your issue or question in detail..."
            value={createForm.message}
            onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

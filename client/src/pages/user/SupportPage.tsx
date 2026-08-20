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
import { Headphones, PlusCircle, MessageSquare, Send, User, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';

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
          <p className="text-xs text-slate-400">Contact Telegram Support directly or open an in-app ticket with our concierge desk.</p>
        </div>

        <Button
          variant="primary"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Support Ticket
        </Button>
      </div>

      {/* Telegram Customer Support Direct Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/80 via-brand-surface to-brand-surface border border-sky-500/40 p-6 md:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs font-bold text-sky-400">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400" /> TELEGRAM 24/7 SUPPORT
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center justify-center md:justify-start gap-2">
              Telegram VIP Customer Support Handle
            </h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Connect directly with our 24/7 official Telegram Support Concierge for instant resolution of deposit inquiries, account management, and VIP assistance.
            </p>
          </div>

          <a
            href="https://t.me/winkmedatingclub_support"
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />} rightIcon={<ExternalLink className="w-4 h-4" />}>
              Open Telegram Support
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket History */}
        <Card className="md:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-slate-100">My Support Tickets</h3>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No support tickets created.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => openTicketConversation(ticket)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedTicket?._id === ticket._id
                      ? 'bg-brand-card border-brand-wine text-slate-100'
                      : 'bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-500">{ticket.ticketId}</span>
                    <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'pending'} size="sm">
                      {ticket.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold truncate">{ticket.subject}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2 flex flex-col h-[500px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-slate-400">Category: {selectedTicket.category}</p>
                </div>
                <Badge variant={selectedTicket.status === 'RESOLVED' ? 'success' : 'pending'}>
                  {selectedTicket.status}
                </Badge>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${msg.senderRole === 'USER' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                        msg.senderRole === 'USER'
                          ? 'bg-brand-wine text-white rounded-br-none'
                          : 'bg-brand-card border border-brand-border text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="font-bold text-[10px] opacity-80">{msg.senderName} ({msg.senderRole})</div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="p-3 border-t border-brand-border flex gap-2">
                <Input
                  placeholder="Type reply message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p>Select a ticket on the left or create a new support ticket to start conversation.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Create New Support Ticket">
          <form onSubmit={handleCreateTicket} className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

            <Select
              label="Support Category"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              options={[
                { label: 'VIP Membership & Verification', value: 'VIP Membership & Verification' },
                { label: 'Add-Funds Deposit & Recharge', value: 'Add-Funds Deposit & Recharge' },
                { label: 'Payout Withdrawal Inquiries', value: 'Payout Withdrawal Inquiries' },
                { label: 'Airborne Product Trading', value: 'Airborne Product Trading' },
                { label: 'Account Security & General', value: 'Account Security & General' },
              ]}
            />

            <Input
              label="Ticket Subject"
              placeholder="Brief summary of your inquiry..."
              value={createForm.subject}
              onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
              required
            />

            <Textarea
              label="Detailed Message Description"
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
      )}
    </div>
  );
};

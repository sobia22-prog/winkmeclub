import api from './api';

export const supportService = {
  createTicket: (data: { category: string; subject: string; message: string; attachmentUrl?: string }) =>
    api.post('/support/tickets', data),
  getMyTickets: () => api.get('/support/tickets'),
  getTicketDetails: (id: string) => api.get(`/support/tickets/${id}`),
  replyTicket: (id: string, message: string, attachmentUrl?: string) =>
    api.post(`/support/tickets/${id}/reply`, { message, attachmentUrl }),
};

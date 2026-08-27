import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AuditLog } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { FileText } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAuditLogs()
      .then((res) => {
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" /> Administrative Audit Trail
        </h1>
        <p className="text-xs text-slate-400">Immutable security logs of sensitive administrative actions and financial balance adjustments.</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading security logs...</Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No audit logs recorded yet.</Card>
      ) : (
        <Table headers={['Admin Email', 'Action Code', 'Target Entity', `Amount (${currencySymbol})`, 'Audit Reason', 'Timestamp']}>
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-semibold text-slate-200">{log.adminEmail}</td>
              <td className="px-5 py-3 font-mono font-bold text-amber-400">
                <Badge variant="warning" size="sm">
                  {log.action}
                </Badge>
              </td>
              <td className="px-5 py-3 text-slate-300">
                {log.targetType} {log.targetId ? `(#${log.targetId.slice(-6)})` : ''}
              </td>
              <td className="px-5 py-3 font-bold text-slate-100">
                {log.amount ? `${currencySymbol}${log.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
              </td>
              <td className="px-5 py-3 text-xs text-slate-400 max-w-xs truncate">{log.reason || 'N/A'}</td>
              <td className="px-5 py-3 text-xs text-slate-500">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { MdInfo, MdFileDownload } from 'react-icons/md';
import { useGetAuditLogsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const AdminAuditLogs = () => {
  const { t, formatDate } = useLanguage();
  const [filterAction, setFilterAction] = useState('all');
  const [filterTarget, setFilterTarget] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: logsData, isLoading } = useGetAuditLogsQuery({
    action: filterAction !== 'all' ? filterAction : undefined,
    target_type: filterTarget !== 'all' ? filterTarget : undefined,
  });

  const logs = logsData?.items || [];

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ['ID', 'Timestamp (IST)', 'Actor Role', 'Actor User', 'Action', 'Target', 'Reason'];
    const rows = logs.map((l) => [
      l.id,
      formatDate(l.createdAt || l.created_at, true),
      l.actor_role,
      l.user ? `${l.user.phone || l.user.email} (#${l.user.id})` : 'System',
      l.action,
      `${l.target_type} #${l.target_id}`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('admin.auditTrailMainTitle', '🔍 Administrative Audit Trail')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('admin.auditTrailMainSubtitle', 'Immutable logs documenting administrative decisions, KYC changes, and financial approvals.')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<MdFileDownload />}
          onClick={exportCSV}
          disabled={!logs.length}
          sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
        >
          Export Audit Trail (CSV)
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Action Type"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="KYC_VERIFIED">KYC Verified</MenuItem>
              <MenuItem value="KYC_REJECTED">KYC Rejected</MenuItem>
              <MenuItem value="KYC_REVOKED">KYC Revoked</MenuItem>
              <MenuItem value="KYC_UNLOCKED">KYC Unlocked</MenuItem>
              <MenuItem value="PAYOUT_APPROVED">Payout Approved</MenuItem>
              <MenuItem value="PAYOUT_HELD">Payout Held</MenuItem>
              <MenuItem value="ORDER_INTERVENTION">Order Intervention</MenuItem>
              <MenuItem value="USER_STATUS">User Status Change</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Target Entity"
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
            >
              <MenuItem value="all">All Target Entities</MenuItem>
              <MenuItem value="USER">User / Farmer</MenuItem>
              <MenuItem value="ORDER">Order</MenuItem>
              <MenuItem value="PAYOUT">Payout</MenuItem>
              <MenuItem value="PRODUCT">Product Listing</MenuItem>
              <MenuItem value="SETTINGS">Platform Settings</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp (IST)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actor (User & Role)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.actionTaken', 'Action Taken')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.targetEntity', 'Target Entity')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.reasonAuditNotes', 'Reason / Audit Notes')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {t('admin.loadingAudit', 'Loading audit trail...')}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('admin.noAuditLogs', 'No administrative actions logged yet.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    <Tooltip title={`UTC: ${new Date(l.createdAt || l.created_at).toUTCString()}`}>
                      <span>{formatDate(l.createdAt || l.created_at, true)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Chip
                        label={l.actor_role.toUpperCase()}
                        size="small"
                        color={l.actor_role === 'super_admin' ? 'primary' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.68rem', width: 'fit-content' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {l.user ? `${l.user.phone || l.user.email} (#${l.user.id})` : 'System Daemon'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{l.action}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${l.target_type} #${l.target_id}`}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 280 }}>
                    {l.reason || t('admin.routineOperation', 'Routine operation')}
                  </TableCell>
                  <TableCell align="right">
                    {l.details ? (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setSelectedLog(l)}
                        startIcon={<MdInfo />}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Inspect
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Log Details Modal */}
      {selectedLog && (
        <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Audit Entry Details: {selectedLog.action}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Target:</Typography>
              <Typography variant="body2" fontWeight={700}>{selectedLog.target_type} #{selectedLog.target_id}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Reason:</Typography>
              <Typography variant="body2">{selectedLog.reason || 'None specified'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Payload / State Diff (JSON):</Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 0.5,
                  borderRadius: 2,
                  bgcolor: '#F8FAF9',
                  border: '1px solid #E2E8F0',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedLog(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminAuditLogs;

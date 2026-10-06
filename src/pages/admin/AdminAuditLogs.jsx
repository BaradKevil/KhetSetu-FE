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
} from '@mui/material';
import { useGetAuditLogsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const AdminAuditLogs = () => {
  const { t, formatDate } = useLanguage();
  const { data: logsData, isLoading } = useGetAuditLogsQuery();
  const logs = logsData?.items || [];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('admin.auditTrailMainTitle', '🔍 Administrative Audit Trail')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin.auditTrailMainSubtitle', 'Immutable logs documenting administrative decisions, KYC changes, and financial approvals.')}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.timestamp', 'Timestamp')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.actorRole', 'Actor Role')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.actionTaken', 'Action Taken')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.targetEntity', 'Target Entity')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.reasonAuditNotes', 'Reason / Audit Notes')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {t('admin.loadingAudit', 'Loading audit trail...')}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('admin.noAuditLogs', 'No administrative actions logged yet.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {formatDate(l.created_at, true)}
                  </TableCell>
                  <TableCell>
                    <Chip label={l.actor_role.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{l.action}</TableCell>
                  <TableCell>{l.target_type} #{l.target_id}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{l.reason || t('admin.routineOperation', 'Routine operation')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminAuditLogs;

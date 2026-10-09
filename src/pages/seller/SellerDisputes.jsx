import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import {
  MdGavel,
  MdWarning,
  MdCheckCircle,
  MdTimer,
  MdOutlinePhotoCamera,
  MdOutlineAttachFile,
  MdInfoOutline,
  MdVisibility,
} from 'react-icons/md';
import { useGetSellerDisputesQuery, useRespondToDisputeMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, formatIST } from '../../common/status';
import PageHeader from '../../common/custom/PageHeader';
import { toast } from 'react-toastify';

export default function SellerDisputes() {
  const { t } = useLanguage();
  const { data: disputes = [], isLoading } = useGetSellerDisputesQuery();
  const respondMutation = useRespondToDisputeMutation();

  const [activeTab, setActiveTab] = useState('all'); // all, open, resolved
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);

  const filteredDisputes = disputes.filter((d) => {
    if (activeTab === 'open') return d.status === 'open' || d.status === 'under_review';
    if (activeTab === 'resolved')
      return (
        d.status === 'resolved_seller' ||
        d.status === 'resolved_buyer_refund' ||
        d.status === 'dismissed'
      );
    return true;
  });

  const handleOpenRespond = (dispute) => {
    setSelectedDispute(dispute);
    setResponseText('');
    setEvidenceUrl('');
    setEvidenceList([]);
    setResponseModalOpen(true);
  };

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setEvidenceList((prev) => [...prev, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.warning(t('farmer.disputeExplainMandatory', 'Please provide a clear explanation or rebuttal.'));
      return;
    }
    try {
      await respondMutation.mutateAsync({
        id: selectedDispute.id,
        response_text: responseText.trim(),
        evidence_images: evidenceList,
      });
      toast.success(t('farmer.disputeSubmittedToast', 'Rebuttal and evidence submitted to KhetSetu arbitration officer.'));
      setResponseModalOpen(false);
    } catch {
      toast.error(t('errors.SOMETHING_WENT_WRONG', 'Failed to submit response. Please retry.'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', label: 'Action Required — Buyer Claim' };
      case 'under_review':
        return { bg: '#FFFBEB', border: '#FED7AA', color: '#D97706', label: 'Under Arbitration Review' };
      case 'resolved_seller':
        return { bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A', label: 'Resolved in Farmer Favor' };
      case 'resolved_buyer_refund':
        return { bg: '#F3F4F6', border: '#E5E7EB', color: '#4B5563', label: 'Settled with Buyer Refund' };
      case 'dismissed':
        return { bg: '#F3F4F6', border: '#E5E7EB', color: '#6B7280', label: 'Claim Dismissed' };
      default:
        return { bg: '#F3F4F6', border: '#E5E7EB', color: '#4B5563', label: status };
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={t('farmer.disputesCenterTitle', '⚖️ Disputes & Arbitration Center')}
        subtitle={t(
          'farmer.disputesCenterDesc',
          'Review buyer quality claims, submit dispatch evidence & weighment slips, and track impartial resolution.'
        )}
        showBack={true}
      />

      {/* SLA Protection Banner */}
      <Alert
        severity="info"
        icon={<MdInfoOutline size={22} />}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid #BFDBFE',
          bgcolor: '#EFF6FF',
          '& .MuiAlert-message': { color: '#1E3A8A' },
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {t('farmer.escrowGuaranteeTitle', 'KhetSetu Fair Arbitration Policy')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {t(
            'farmer.escrowGuaranteeText',
            'Your escrow payouts are protected against arbitrary deductions. If a buyer claims quality mismatch or transit shortage, you have 48 hours to provide dispatch photos or electronic weighment receipts before any settlement is decided.'
          )}
        </Typography>
      </Alert>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {[
          { id: 'all', label: t('common.all', 'All Disputes') },
          { id: 'open', label: t('farmer.activeDisputes', 'Active / Needs Reply') },
          { id: 'resolved', label: t('farmer.resolvedDisputes', 'Resolved & Closed') },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'contained' : 'outlined'}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.75,
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              bgcolor: activeTab === tab.id ? '#2563EB' : 'transparent',
              borderColor: activeTab === tab.id ? '#2563EB' : '#E2E8F0',
              color: activeTab === tab.id ? '#fff' : '#64748B',
              '&:hover': {
                bgcolor: activeTab === tab.id ? '#1D4ED8' : '#F1F5F9',
              },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredDisputes.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '1px dashed #CBD5E1',
            bgcolor: '#FAFAFA',
          }}
        >
          <MdCheckCircle size={52} color="#16A34A" style={{ marginBottom: 16 }} />
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            {t('farmer.noDisputesTitle', 'Zero Active Disputes!')}
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 1, maxWidth: 460, mx: 'auto' }}>
            {t(
              'farmer.noDisputesDesc',
              'Your shipments and produce quality match high standards. No buyers have raised unresolved quality or weight complaints.'
            )}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredDisputes.map((dispute) => {
            const st = getStatusColor(dispute.status);
            const orderNum = dispute.order?.order_number || `ORD-${dispute.order_id}`;
            const buyerName =
              dispute.order?.buyer?.buyer_profile?.company_name ||
              dispute.raised_by_user?.phone ||
              'Verified Buyer';

            return (
              <Paper
                key={dispute.id}
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: st.border,
                  bgcolor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                        {dispute.dispute_number}
                      </Typography>
                      <Chip
                        label={st.label}
                        size="small"
                        sx={{
                          bgcolor: st.bg,
                          color: st.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: `1px solid ${st.border}`,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="#64748B">
                      {t('farmer.disputeForOrder', 'Order')}: <strong>{orderNum}</strong> • {t('farmer.buyer', 'Buyer')}:{' '}
                      <strong>{buyerName}</strong> • {formatIST(dispute.created_at)}
                    </Typography>
                  </Box>

                  {dispute.status === 'open' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<MdOutlinePhotoCamera />}
                      onClick={() => handleOpenRespond(dispute)}
                      sx={{
                        bgcolor: '#2563EB',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 2.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      {t('farmer.respondWithEvidence', 'Respond with Evidence')}
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Dispute Details */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase">
                      {t('farmer.buyerClaimReason', 'Buyer Claim Reason')}
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#DC2626" sx={{ mt: 0.5 }}>
                      {dispute.reason}
                    </Typography>
                    <Typography variant="body2" color="#334155" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {dispute.details}
                    </Typography>

                    {/* Buyer evidence photos */}
                    {dispute.evidence_images && dispute.evidence_images.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" fontWeight={600} color="#64748B">
                          {t('farmer.buyerEvidencePhotos', 'Buyer Uploaded Photos')}:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {dispute.evidence_images.map((img, idx) => (
                            <Box
                              key={idx}
                              component="a"
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                              sx={{
                                width: 72,
                                height: 72,
                                borderRadius: 2,
                                border: '1px solid #CBD5E1',
                                overflow: 'hidden',
                                display: 'block',
                                '&:hover': { opacity: 0.8 },
                              }}
                            >
                              <img
                                src={img}
                                alt={`Evidence ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Resolution Notes / Seller Rebuttal */}
                  <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase">
                      {t('farmer.arbitrationLog', 'Arbitration & Rebuttal Log')}
                    </Typography>
                    {dispute.resolution_notes ? (
                      <Typography variant="body2" color="#1E293B" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {dispute.resolution_notes}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1, fontStyle: 'italic' }}>
                        {t(
                          'farmer.noRebuttalYet',
                          'No response submitted yet. Click "Respond with Evidence" to submit weighment slip or dispatch photos.'
                        )}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Response / Rebuttal Modal */}
      <Dialog
        open={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {t('farmer.submitRebuttalTitle', 'Submit Dispute Rebuttal & Evidence')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
            {t(
              'farmer.rebuttalInstructions',
              'Explain how produce was weighed, packed, and loaded. Add links to photos of the dispatch weighment slip or truck seal.'
            )}
          </Typography>

          <TextField
            label={t('farmer.rebuttalStatement', 'Farmer Explanation / Counter-Statement')}
            multiline
            rows={4}
            fullWidth
            required
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={t(
              'farmer.rebuttalPlaceholder',
              'e.g., The produce was weighed at APMC electronic weighbridge (slip attached). Weighment was exactly 40 Quintals with 0% moisture.'
            )}
            sx={{ mb: 2.5 }}
          />

          <Typography variant="subtitle2" fontWeight={700} color="#1E293B" sx={{ mb: 1 }}>
            {t('farmer.attachEvidenceUrls', 'Attach Photo or Document URLs (Weighment slip, Mandi receipt)')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="https://... photo or document url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={handleAddEvidence}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {t('common.add', 'Add')}
            </Button>
          </Box>

          {evidenceList.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {evidenceList.map((url, i) => (
                <Chip
                  key={i}
                  label={`Proof #${i + 1}`}
                  onDelete={() => setEvidenceList((prev) => prev.filter((_, idx) => idx !== i))}
                  size="small"
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setResponseModalOpen(false)}
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={respondMutation.isPending}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {respondMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('farmer.submitRebuttalBtn', 'Submit Rebuttal to Officer')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

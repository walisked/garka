import React, { useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { authAPI } from '../../api/auth';
import paymentsAPI from '../../api/payments';
import { useAuth } from '../../contexts/AuthContext';

const PaymentModal = ({ open, onClose, property, agent, onSuccess }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { token } = useAuth();

  const handlePay = async () => {
    // If there's no verificationId (local dev), simulate a successful payment locally
    if (!property || !property.verificationId) {
      alert(`Paid for ${property?.title || 'property'} (placeholder)`);
      if (typeof onSuccess === 'function') {
        onSuccess({ propertyId: property?.id, reservedUntil: Date.now() + 12 * 60 * 60 * 1000 });
      }
      onClose?.();
      return;
    }

    try {
      const res = await paymentsAPI.initiateMonnify({ verificationId: property.verificationId, amount: property.verificationFee || property.price }, token);
      const init = res.data?.init || res.data?.data?.init || res.data?.init;
      const checkoutUrl = init?.checkoutUrl || init?.responseData?.checkoutUrl || init?.payload?.checkoutUrl;
      if (checkoutUrl) {
        // In production we redirect to checkout
        window.location.href = checkoutUrl;
      } else {
        // Sandbox fallback: call simulateComplete to mark verification as paid and get reservation info
        try {
          const sim = await paymentsAPI.simulateComplete(property.verificationId, token);
          const verification = sim.verification || (sim.data && sim.data.verification) || null;
          const reservedUntil = verification?.reservedUntil ? new Date(verification.reservedUntil).getTime() : Date.now() + 12 * 60 * 60 * 1000;
          if (typeof onSuccess === 'function') {
            onSuccess({ propertyId: property?.id, reservedUntil });
          }
          alert('Payment completed (sandbox)');
        } catch (e) {
          console.error('Sandbox payment simulation failed', e);
          alert('Payment initialization failed');
        }

        onClose?.();
      }
    } catch (err) {
      console.error(err);
      alert('Payment failed to initialize');
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Pay for Property</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle1">{property?.title || 'Selected Property'}</Typography>
          <Typography variant="body2" color="text.secondary">Agent: {agent?.name || '—'}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>{property ? `₦${(property.price || 0).toLocaleString()}` : 'Amount not available'}</Typography>
          <Typography variant="body2" color="text.secondary">This is a placeholder payment modal for local development.</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handlePay}>Pay Now</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;

import React, { useEffect, useState } from 'react';
import verificationAPI from '../../api/verification.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function VerificationDetails({ verificationId }) {
  const { user, token } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await verificationAPI.getVerification(verificationId, token);
        setVerification(res.verification);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [verificationId, token]);

  const handleClaim = async () => {
    try {
      await verificationAPI.claimVerification(verificationId, token);
      const res = await verificationAPI.getVerification(verificationId, token);
      setVerification(res.verification);
    } catch (err) {
      console.error(err);
      alert('Claim failed');
    }
  };

  const handleApprove = async () => {
    try {
      await verificationAPI.approveVerification(verificationId, 'Approved by admin', token);
      const res = await verificationAPI.getVerification(verificationId, token);
      setVerification(res.verification);
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!verification) return <div>No verification found</div>;

  const canClaim = ['DEAL_INITIATOR', 'AGENT'].includes(user?.role) && verification.requestStatus === 'submitted';
  const canApprove = user?.role === 'ADMIN';

  return (
    <div>
      <h2>Verification Details</h2>
      <div>Property: {verification.property?.title || 'N/A'}</div>
      <div>Status: {verification.requestStatus}</div>
      <div>Payment: {verification.paymentStatus}</div>

      {verification.dealInitiatorInfo && (
        <div>
          <h3>Deal Initiator</h3>
          <div>{verification.dealInitiatorInfo.fullName}</div>
          <div>{verification.dealInitiatorInfo.phone}</div>
        </div>
      )}

      {canClaim && <button onClick={handleClaim}>Claim</button>}
      {canApprove && <button onClick={handleApprove}>Approve</button>}
    </div>
  );
}
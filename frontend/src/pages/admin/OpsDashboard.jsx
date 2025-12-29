import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function OpsDashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/ops/status');
        setStatus(res.data.counts);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  if (!status) return <div>Loading...</div>;

  return (
    <div>
      <h2>Ops Dashboard</h2>
      <div>Stuck payouts: {status.stuckPayouts}</div>
      <div>Held verifications: {status.stuckHeldVerifications}</div>
    </div>
  );
}
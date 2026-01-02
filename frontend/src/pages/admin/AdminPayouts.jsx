import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    // placeholder: fetch pending payouts
    const fetch = async () => {
      try {
        const res = await api.get('/admin/payouts');
        setPayouts(res.data.payouts || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const handlePayout = async (id) => {
    try {
      await api.post(`/admin/payout/${id}`);
      setPayouts(payouts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Payout failed');
    }
  };

  return (
    <div>
      <h2>Pending Payouts</h2>
      {payouts.length === 0 && <div>No payouts</div>}
      <ul>
        {payouts.map(p => (
          <li key={p._id}>
            {p.type} - {p.amount} - {p.recipient}
            <button onClick={() => handlePayout(p._id)}>Process</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
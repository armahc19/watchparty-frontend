import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SubscribeSuccess = () => {
  const [status, setStatus] = useState('verifying');
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('reference');

  useEffect(() => {
    if (ref) {
      axios.get(`/api/subscribe/verify?ref=${ref}`)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [ref]);

  if (status === 'verifying') return <p>Verifying payment...</p>;
  if (status === 'error') return <p>Payment failed. Try again.</p>;

  return <p>Success! You're now premium. Enjoy unlimited syncs!</p>;
};

export default SubscribeSuccess;
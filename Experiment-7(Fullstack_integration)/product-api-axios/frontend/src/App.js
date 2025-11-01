import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error fetching products');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', fontFamily: 'Arial' }}>
      <h2>Product List</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <b>{p.name}</b>: ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

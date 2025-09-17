import React from 'react';


const ProductDisplay = (props) => {
  const stockStatus = props.inStock ? 'In Stock' : 'Out of Stock';

  return (
    <article className="item-card">
      <h3 className="item-name">{props.name}</h3>
      <div className="item-price">Price: {props.price}</div>
      <div className="item-status">Status: {stockStatus}</div>
    </article>
  );
};
export default ProductDisplay;

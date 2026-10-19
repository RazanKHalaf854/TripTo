import "../Style/Explore.css";


const PromoSection = () => {
  const promos = [
    {
      title: "10% discounts on stays",
      desc: "Enjoy discounts at participating properties worldwide.",
    },
    {
      title: "Travel off season",
      desc: "Avoid peak times and enjoy lower and fewer crowds.",
    },
    {
      title: "Exclusive deals",
      desc: "Enjoy discounts at participating properties worldwide.",
    },
    {
      title: "Weekend Special",
      desc: "Enjoy 12% off weekend stays.",
    },
  ];

  return (
    <div className="promo-wrapper">
      <h2 className="promo-main-title">Travel more, spend less</h2>
      <div className="promo-container">
        {promos.map((promo, index) => (
          <div key={index} className="promo-card">
            <h4 className="promo-card-title">{promo.title}</h4>
            <p className="promo-card-desc">{promo.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoSection;
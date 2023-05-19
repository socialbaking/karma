import { usePartners } from "../data/provider";

export function Partners() {
  const partners = usePartners();
  return (
    <div className="partner-list">
      {partners.map((partner, index) => (
        <div key={index} className="partner-list-item">
          <div className="partner-list-item-name">{partner.partnerName}</div>
        </div>
      ))}
    </div>
  );
}

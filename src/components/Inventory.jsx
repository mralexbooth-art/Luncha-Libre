// Inventory drawer / offering picker. Two presentations:
//   - Default: small footer strip showing carried items
//   - Offering: highlighted, items become buttons that pick an offering
// Also exposes "Lie" and "Remain silent" options when in offering mode.

export default function Inventory({ items, offering = false, onOffer, onLie, onSilent }) {
  return (
    <div className={`inventory ${offering ? 'is-offering' : ''}`}>
      <div className="inventory__title">
        {offering ? 'Offer something — or don\'t.' : 'You are carrying:'}
      </div>
      <div className="inventory__items">
        {items.length === 0 && (
          <span className="inventory__empty">(empty)</span>
        )}
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className="inventory__item"
            disabled={!offering}
            onClick={offering ? () => onOffer?.(item.id) : undefined}
            title={item.name + (item.charges != null ? ` (${item.charges} left)` : '')}
          >
            <span className="inventory__item-icon">{item.icon}</span>
            <span className="inventory__item-name">{item.name}</span>
            {item.charges != null && (
              <span className="inventory__item-charges">×{item.charges}</span>
            )}
          </button>
        ))}
      </div>
      {offering && (
        <div className="inventory__alts">
          <button type="button" className="inventory__alt" onClick={onLie}>Lie — "I have nothing."</button>
          <button type="button" className="inventory__alt" onClick={onSilent}>Remain silent.</button>
        </div>
      )}
    </div>
  )
}

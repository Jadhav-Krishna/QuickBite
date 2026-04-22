import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function ItemDetails() {

  // Mock item based on ID
  const item = {
    name: "Truffle Risotto",
    desc: "Arborio rice, black truffle, aged parmesan, finished with white truffle oil and fresh herbs.",
    price: "₹2,240",
    img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Vegetarian", "Chef's Special", "Contains Dairy"]
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <Link to="/menu" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
        ← Back to Menu
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="w-full h-80 md:h-[500px] rounded-[2rem] overflow-hidden shadow-ambient relative">
          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <div className="flex gap-2 mb-4">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-[var(--color-surface-container-highest)] rounded-full text-xs font-bold text-[var(--color-on-surface-variant)]">{tag}</span>
              ))}
            </div>
            <h1 className="font-display font-bold text-5xl mb-4">{item.name}</h1>
            <p className="font-sans text-[var(--color-on-surface-variant)] text-lg leading-relaxed">{item.desc}</p>
          </div>

          <div className="pt-8 border-t border-[var(--color-surface-variant)]">
            <h3 className="font-serif text-3xl font-bold mb-6">{item.price}</h3>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-4 bg-[var(--color-surface-container-high)] px-4 py-2 rounded-full">
                <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-white transition-colors">-</button>
                <span className="font-bold w-4 text-center">1</span>
                <button className="w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-white transition-colors">+</button>
              </div>
              <p className="font-sans text-sm text-[var(--color-on-surface-variant)]">Total: {item.price}</p>
            </div>

            <Link to="/cart">
              <Button variant="primary" fullWidth>Add to Order</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

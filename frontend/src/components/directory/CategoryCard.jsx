import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ category, image, count }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?category=${category.toLowerCase()}`);
  };

  return (
    <div
      onClick={handleClick}
      className="category-card flex-shrink-0 w-[200px] snap-start group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-[280px] rounded-2xl overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={image}
          alt={category}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-mint/0 via-mint/0 to-mint/0 group-hover:via-mint/20 transition-all duration-500"></div>
        
        <h3 className="absolute bottom-6 left-6 right-6 text-white font-heading font-black text-xl">
          {category}
        </h3>
        
        {count && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-forest font-bold text-sm">
            {count}
          </div>
        )}
      </div>
    </div>
  );
}

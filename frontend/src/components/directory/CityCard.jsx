import { useNavigate } from 'react-router-dom';

export default function CityCard({ city, image, count }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?city=${city.toLowerCase()}`);
  };

  return (
    <div onClick={handleClick} className="city-card group cursor-pointer">
      <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-border group-hover:border-mint transition-all duration-300">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
          alt={`${city} cityscape`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-white font-heading font-black text-xl">
          {city}
        </h3>
        {count && (
          <p className="absolute bottom-4 right-4 text-white text-xs font-semibold">
            {count.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

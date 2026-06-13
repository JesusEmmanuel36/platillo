export default function ProductCard({
  name,
  price,
  description,
  stock,
  image,
  onAdd,
  priceType,
  restaurantOpen,
}) {
  return (
    <div className="bg-white rounded-[5px] shadow-[0_0px_5px_rgba(0,0,0,0.25)] flex flex-col gap-0 w-full">
      
      {/* Fila principal: info + imagen */}
      <div className="flex flex-row gap-3 p-3 pb-2">
        
        {/* Info izquierda */}
        <div className="flex flex-col gap-[5px] flex-1">
          {/* Stock badge */}
          <div
            className={`text-[12px] self-start flex flex-row items-center gap-1 rounded-[10px] px-2 py-[1px] ${
              stock
                ? "bg-[var(--green-color)] text-[var(--green-text-color)]"
                : "bg-[var(--red-color)] text-[var(--red-text-color)]"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                stock ? "bg-[var(--green-text-color)]" : "bg-[var(--red-text-color)]"
              }`}
            />
            {stock ? "En stock" : "Agotado"}
          </div>

          <p className="font-semibold">{name}</p>

          <p className="text-[14px] text-[var(--gray-color)]">
            {description.length > 60
              ? description.slice(0, 57) + "..."
              : description}
          </p>

          <p className="font-semibold">
            {priceType === "dynamic" ? "Desde " : ""}${price} MXN
          </p>
        </div>

        {/* Imagen derecha */}
        <img
          className="w-[100px] h-[100px] rounded-[6px] object-cover flex-shrink-0"
          src={image}
        />
      </div>

      {/* Botón abajo */}
      <div className="px-3 pb-3">
        <button
          className="cursor-pointer w-full bg-[var(--accent-color)] text-white p-1 rounded-[5px] disabled:bg-[var(--light-accent)] disabled:cursor-not-allowed"
          disabled={!stock || !restaurantOpen}
          onClick={onAdd}
        >
          {!restaurantOpen ? "No disponible" : stock ? "Agregar" : "Agotado"}
        </button>
      </div>
    </div>
  );
}
export default function ProductCard({
  name,
  price,
  description,
  stock,
  image,
  onAdd,
  priceType
}) {

  console.log(priceType)
  return (
    <div className="bg-white rounded-[5px] shadow-[0_0px_5px_rgba(0,0,0,0.25)] flex flex-col p-0 gap-2">
      <img className="w-full rounded-[4px]" src={image}></img>

      <div className="flex flex-col gap-[5px] p-2 pt-0">
        <div
          className={`text-[12px] w-19 flex flex-row justify-between items-center rounded-[10px] px-2 py-[1px] ${
            stock
              ? "bg-[var(--green-color)] text-[var(--green-text-color)]"
              : "bg-[var(--red-color)] text-[var(--red-text-color)]"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              stock
                ? "bg-[var(--green-text-color)]"
                : "bg-[var(--red-text-color)]"
            }`}
          ></div>

          {stock ? "En stock" : "Agotado"}
        </div>

        <p className="font-semibold">{name}</p>
        <p className="text-[14px] text-[var(--gray-color)]">
          {description.length > 42
            ? description.slice(0, 39) + "..."
            : description}
        </p>

        <p className="">{` ${(priceType === "dynamic") ? "Desde " : ""} $${price} MXN`}</p>
        <button
          className="cursor-pointer bg-[var(--accent-color)] text-white p-1 rounded-[5px] disabled:bg-[var(--light-accent)] disabled:cursor-not-allowed"
          disabled={!stock}
          onClick={onAdd}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

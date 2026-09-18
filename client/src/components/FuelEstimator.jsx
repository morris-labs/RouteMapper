import { useState } from 'react';

export default function FuelEstimator({ totalMiles }) {
  const [mpg, setMpg] = useState(25);
  const [pricePerGallon, setPricePerGallon] = useState(3.5);

  const mpgValue = Number(mpg);
  const priceValue = Number(pricePerGallon);
  const canCompute = totalMiles > 0 && mpgValue > 0 && priceValue >= 0;
  const gallons = canCompute ? totalMiles / mpgValue : 0;
  const cost = gallons * priceValue;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
      <h2 className="text-sm font-semibold text-slate-900">Fuel estimate</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-xs text-slate-500">Miles per gallon</span>
          <input
            type="number"
            min="1"
            step="0.1"
            value={mpg}
            onChange={(e) => setMpg(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-slate-500">Price per gallon ($)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pricePerGallon}
            onChange={(e) => setPricePerGallon(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
      </div>
      <div className="mt-3 flex justify-between text-slate-700">
        <span><strong className="text-slate-900">{gallons.toFixed(2)}</strong> gal</span>
        <span><strong className="text-slate-900">${cost.toFixed(2)}</strong> est. cost</span>
      </div>
    </div>
  );
}

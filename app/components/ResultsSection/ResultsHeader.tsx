import { PackageCheck } from "lucide-react";

type Props = {
  itemCount: number;
  comparableCount: number;
  storeCount: number;
};

export default function ResultsHeader({
  itemCount,
  comparableCount,
  storeCount,
}: Props) {
  return (
    <div className="results-header">
      <span className="section-kicker">PRIJSVERGELIJKING</span>
      <h2>Je boodschappen, vergeleken</h2>
      <p>
        <PackageCheck size={14} aria-hidden="true" />
        {comparableCount} van {itemCount}{" "}
        {itemCount === 1 ? "product" : "producten"} vergeleken · {storeCount}{" "}
        {storeCount === 1 ? "winkel" : "winkels"} in je zoekradius
      </p>
    </div>
  );
}

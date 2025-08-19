import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Filter, Percent, Hash } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Verkeersinbreuken — PZ Antwerpen (2015–2023)
 *
 * Bron: Federale Politie – Overzicht Verkeersinbreuken PZ 5345 (Antwerpen) sluitingsdatum databank 30/04/2024.
 * De waarden hieronder zijn integraal overgenomen uit het officiële PDF-rapport.
 *
 * Functionaliteit:
 * - Kies thema's (overtredingscategorieën) om te visualiseren
 * - Jaartrend (2015–2023)
 * - Per maand voor 2023
 * - Snelheidsbanden (jaartrend en 2023 per maand)
 * - Niet‑snelheid zwaartegraad (jaartrend en 2023 per maand)
 * - Tabel + CSV‑export
 */

// Helper: NL maandlabels
const MONTHS_NL = [
  "Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"
];

// Kleurenpalet (reproducible maar eenvoudig)
const COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0891b2", "#84cc16",
  "#9333ea", "#059669", "#f59e0b", "#3b82f6", "#ef4444", "#14b8a6", "#a855f7",
  "#10b981", "#e11d48", "#0ea5e9", "#22c55e"
];

// Themacollectie (exacte labels uit het rapport)
const THEMES = [
  "Snelheid",
  "Stilstaan en parkeren",
  "GSM",
  "Helm en beschermende kledij",
  "Gordel en kinderzitje",
  "Verkeerslichten",
  "Wegcode (rest)",
  "Alcohol",
  "Drugs",
  "Inschrijving",
  "Rijbewijs",
  "Technische eisen",
  "Verzekering",
  "Zwaar vervoer",
  "Andere",
  "Onbekend",
] as const;

type Theme = typeof THEMES[number];

type YearlyTotalsRow = { year: number } & { [K in Theme]?: number } & { Totaal?: number };

// Jaarlijkse totalen per thema (2015–2023)
const YEARLY_TOTALS: YearlyTotalsRow[] = [
  { year: 2015, "Snelheid": 181146, "Stilstaan en parkeren": 99238, GSM: 11583, "Helm en beschermende kledij": 609, "Gordel en kinderzitje": 4221, Verkeerslichten: 19325, "Wegcode (rest)": 28658, Alcohol: 2406, Drugs: 394, Inschrijving: 2039, Rijbewijs: 4024, "Technische eisen": 4168, Verzekering: 2295, "Zwaar vervoer": 1615, Andere: 149, Onbekend: 50, Totaal: 361920 },
  { year: 2016, "Snelheid": 187038, "Stilstaan en parkeren": 99180, GSM: 12439, "Helm en beschermende kledij": 628, "Gordel en kinderzitje": 3250, Verkeerslichten: 15089, "Wegcode (rest)": 30264, Alcohol: 2729, Drugs: 646, Inschrijving: 2084, Rijbewijs: 4162, "Technische eisen": 4094, Verzekering: 2339, "Zwaar vervoer": 1411, Andere: 79, Onbekend: 9, Totaal: 365441 },
  { year: 2017, "Snelheid": 164671, "Stilstaan en parkeren": 97009, GSM: 12049, "Helm en beschermende kledij": 716, "Gordel en kinderzitje": 2485, Verkeerslichten: 11901, "Wegcode (rest)": 28342, Alcohol: 2161, Drugs: 515, Inschrijving: 1858, Rijbewijs: 3980, "Technische eisen": 3782, Verzekering: 2161, "Zwaar vervoer": 1653, Andere: 64, Onbekend: 23, Totaal: 333370 },
  { year: 2018, "Snelheid": 243249, "Stilstaan en parkeren": 105250, GSM: 14530, "Helm en beschermende kledij": 1065, "Gordel en kinderzitje": 2373, Verkeerslichten: 13174, "Wegcode (rest)": 34568, Alcohol: 1956, Drugs: 516, Inschrijving: 2121, Rijbewijs: 4011, "Technische eisen": 4438, Verzekering: 2328, "Zwaar vervoer": 1900, Andere: 113, Onbekend: 8, Totaal: 431600 },
  { year: 2019, "Snelheid": 284855, "Stilstaan en parkeren": 100211, GSM: 15494, "Helm en beschermende kledij": 984, "Gordel en kinderzitje": 2480, Verkeerslichten: 18391, "Wegcode (rest)": 42606, Alcohol: 2002, Drugs: 724, Inschrijving: 2344, Rijbewijs: 4257, "Technische eisen": 4380, Verzekering: 2524, "Zwaar vervoer": 2181, Andere: 287, Onbekend: 13, Totaal: 483733 },
  { year: 2020, "Snelheid": 375121, "Stilstaan en parkeren": 82897, GSM: 16568, "Helm en beschermende kledij": 990, "Gordel en kinderzitje": 2014, Verkeerslichten: 13905, "Wegcode (rest)": 38465, Alcohol: 1129, Drugs: 823, Inschrijving: 2571, Rijbewijs: 4638, "Technische eisen": 3103, Verzekering: 2318, "Zwaar vervoer": 2289, Andere: 150, Onbekend: 3, Totaal: 546984 },
  { year: 2021, "Snelheid": 424530, "Stilstaan en parkeren": 85427, GSM: 16060, "Helm en beschermende kledij": 944, "Gordel en kinderzitje": 2761, Verkeerslichten: 14881, "Wegcode (rest)": 41839, Alcohol: 1179, Drugs: 865, Inschrijving: 2104, Rijbewijs: 5220, "Technische eisen": 3063, Verzekering: 2104, "Zwaar vervoer": 2097, Andere: 269, Onbekend: 10, Totaal: 603353 },
  { year: 2022, "Snelheid": 840113, "Stilstaan en parkeren": 78230, GSM: 15071, "Helm en beschermende kledij": 1078, "Gordel en kinderzitje": 2501, Verkeerslichten: 15189, "Wegcode (rest)": 41504, Alcohol: 1660, Drugs: 712, Inschrijving: 2120, Rijbewijs: 4606, "Technische eisen": 3977, Verzekering: 2295, "Zwaar vervoer": 1506, Andere: 269, Onbekend: 26, Totaal: 1010857 },
  { year: 2023, "Snelheid": 799244, "Stilstaan en parkeren": 71231, GSM: 13187, "Helm en beschermende kledij": 829, "Gordel en kinderzitje": 2073, Verkeerslichten: 17838, "Wegcode (rest)": 37402, Alcohol: 1441, Drugs: 683, Inschrijving: 2212, Rijbewijs: 3969, "Technische eisen": 4025, Verzekering: 2107, "Zwaar vervoer": 1385, Andere: 437, Onbekend: 48, Totaal: 958111 },
];

// 2023 per maand per thema
const MONTHLY_2023: ( { maand: string } & { [K in Theme]?: number } & { Totaal?: number } )[] = [
  { maand: "Jan", "Snelheid": 77352, "Stilstaan en parkeren": 5986, GSM: 917, "Helm en beschermende kledij": 18, "Gordel en kinderzitje": 207, Verkeerslichten: 1439, "Wegcode (rest)": 2840, Alcohol: 161, Drugs: 83, Inschrijving: 221, Rijbewijs: 384, "Technische eisen": 444, Verzekering: 205, "Zwaar vervoer": 83, Andere: 43, Onbekend: 2, Totaal: 90385 },
  { maand: "Feb", "Snelheid": 58562, "Stilstaan en parkeren": 7251, GSM: 1323, "Helm en beschermende kledij": 28, "Gordel en kinderzitje": 168, Verkeerslichten: 1242, "Wegcode (rest)": 3174, Alcohol: 126, Drugs: 75, Inschrijving: 176, Rijbewijs: 387, "Technische eisen": 347, Verzekering: 188, "Zwaar vervoer": 216, Andere: 38, Onbekend: 7, Totaal: 73308 },
  { maand: "Maa", "Snelheid": 79760, "Stilstaan en parkeren": 8879, GSM: 1460, "Helm en beschermende kledij": 26, "Gordel en kinderzitje": 189, Verkeerslichten: 1663, "Wegcode (rest)": 4573, Alcohol: 129, Drugs: 59, Inschrijving: 228, Rijbewijs: 379, "Technische eisen": 367, Verzekering: 174, "Zwaar vervoer": 180, Andere: 30, Onbekend: 1, Totaal: 98097 },
  { maand: "Apr", "Snelheid": 70215, "Stilstaan en parkeren": 6533, GSM: 944, "Helm en beschermende kledij": 46, "Gordel en kinderzitje": 141, Verkeerslichten: 1410, "Wegcode (rest)": 3077, Alcohol: 105, Drugs: 53, Inschrijving: 179, Rijbewijs: 317, "Technische eisen": 295, Verzekering: 166, "Zwaar vervoer": 132, Andere: 31, Onbekend: 3, Totaal: 83647 },
  { maand: "Mei", "Snelheid": 76253, "Stilstaan en parkeren": 6171, GSM: 1267, "Helm en beschermende kledij": 86, "Gordel en kinderzitje": 188, Verkeerslichten: 1632, "Wegcode (rest)": 3557, Alcohol: 109, Drugs: 56, Inschrijving: 185, Rijbewijs: 356, "Technische eisen": 342, Verzekering: 161, "Zwaar vervoer": 181, Andere: 32, Onbekend: 0, Totaal: 90576 },
  { maand: "Jun", "Snelheid": 72645, "Stilstaan en parkeren": 5256, GSM: 1276, "Helm en beschermende kledij": 173, "Gordel en kinderzitje": 264, Verkeerslichten: 1840, "Wegcode (rest)": 4263, Alcohol: 123, Drugs: 44, Inschrijving: 193, Rijbewijs: 373, "Technische eisen": 365, Verzekering: 194, "Zwaar vervoer": 135, Andere: 51, Onbekend: 2, Totaal: 87197 },
  { maand: "Jul", "Snelheid": 76767, "Stilstaan en parkeren": 3934, GSM: 932, "Helm en beschermende kledij": 87, "Gordel en kinderzitje": 200, Verkeerslichten: 1207, "Wegcode (rest)": 2575, Alcohol: 122, Drugs: 56, Inschrijving: 183, Rijbewijs: 336, "Technische eisen": 330, Verzekering: 196, "Zwaar vervoer": 55, Andere: 36, Onbekend: 2, Totaal: 87018 },
  { maand: "Aug", "Snelheid": 50363, "Stilstaan en parkeren": 4162, GSM: 956, "Helm en beschermende kledij": 88, "Gordel en kinderzitje": 149, Verkeerslichten: 1339, "Wegcode (rest)": 2118, Alcohol: 115, Drugs: 52, Inschrijving: 163, Rijbewijs: 298, "Technische eisen": 258, Verzekering: 176, "Zwaar vervoer": 31, Andere: 42, Onbekend: 5, Totaal: 60315 },
  { maand: "Sep", "Snelheid": 51441, "Stilstaan en parkeren": 5007, GSM: 1470, "Helm en beschermende kledij": 136, "Gordel en kinderzitje": 179, Verkeerslichten: 1807, "Wegcode (rest)": 3355, Alcohol: 99, Drugs: 42, Inschrijving: 168, Rijbewijs: 285, "Technische eisen": 305, Verzekering: 189, "Zwaar vervoer": 106, Andere: 36, Onbekend: 11, Totaal: 64636 },
  { maand: "Okt", "Snelheid": 67453, "Stilstaan en parkeren": 6219, GSM: 1343, "Helm en beschermende kledij": 88, "Gordel en kinderzitje": 150, Verkeerslichten: 1682, "Wegcode (rest)": 2995, Alcohol: 116, Drugs: 41, Inschrijving: 181, Rijbewijs: 248, "Technische eisen": 301, Verzekering: 155, "Zwaar vervoer": 115, Andere: 28, Onbekend: 6, Totaal: 81121 },
  { maand: "Nov", "Snelheid": 50194, "Stilstaan en parkeren": 6107, GSM: 718, "Helm en beschermende kledij": 30, "Gordel en kinderzitje": 128, Verkeerslichten: 1424, "Wegcode (rest)": 2431, Alcohol: 113, Drugs: 52, Inschrijving: 145, Rijbewijs: 301, "Technische eisen": 327, Verzekering: 163, "Zwaar vervoer": 101, Andere: 36, Onbekend: 5, Totaal: 62275 },
  { maand: "Dec", "Snelheid": 68239, "Stilstaan en parkeren": 5726, GSM: 581, "Helm en beschermende kledij": 23, "Gordel en kinderzitje": 110, Verkeerslichten: 1153, "Wegcode (rest)": 2444, Alcohol: 123, Drugs: 70, Inschrijving: 190, Rijbewijs: 305, "Technische eisen": 344, Verzekering: 140, "Zwaar vervoer": 50, Andere: 34, Onbekend: 4, Totaal: 79536 },
];

// Snelheidsbanden per jaar
const SPEED_BANDS_YEARLY = [
  { year: 2015, _0_10: 50485, _11_20: 98906, _21_30: 25193, _31_40: 4651, _gt40: 1138, _unk: 773 },
  { year: 2016, _0_10: 52939, _11_20: 107847, _21_30: 20465, _31_40: 3676, _gt40: 1236, _unk: 875 },
  { year: 2017, _0_10: 49166, _11_20: 92344, _21_30: 17929, _31_40: 3480, _gt40: 848, _unk: 904 },
  { year: 2018, _0_10: 94290, _11_20: 118878, _21_30: 23659, _31_40: 4203, _gt40: 1142, _unk: 1077 },
  { year: 2019, _0_10: 143211, _11_20: 115662, _21_30: 20235, _31_40: 3302, _gt40: 1090, _unk: 1355 },
  { year: 2020, _0_10: 257181, _11_20: 93463, _21_30: 17950, _31_40: 3641, _gt40: 1365, _unk: 1521 },
  { year: 2021, _0_10: 337932, _11_20: 71072, _21_30: 11025, _31_40: 2214, _gt40: 923, _unk: 1364 },
  { year: 2022, _0_10: 692184, _11_20: 118797, _21_30: 21784, _31_40: 4400, _gt40: 1971, _unk: 977 },
  { year: 2023, _0_10: 687180, _11_20: 89683, _21_30: 16081, _31_40: 3522, _gt40: 1883, _unk: 895 },
];

// Snelheidsbanden per maand (2023)
const SPEED_BANDS_MONTHLY_2023 = MONTHS_NL.map((m, i) => ({
  maand: m,
  _0_10: [66261,50860,68936,60183,65401,61613,65871,43587,44869,58286,43230,58083][i],
  _11_20: [8976,6142,8728,7850,8557,8927,8812,5442,5285,7358,5535,8071][i],
  _21_30: [1565,1123,1499,1579,1647,1566,1538,941,870,1256,1006,1491][i],
  _31_40: [307,234,337,358,371,307,308,204,238,280,242,336][i],
  _gt40: [166,114,187,155,178,161,173,119,113,217,125,175][i],
  _unk: [77,89,73,90,99,71,65,70,66,56,56,83][i],
}));

// Niet‑snelheid zwaartegraad per jaar
const NONSPEED_SEVERITY_YEARLY = [
  { year: 2015, graad1: 94185, graad2: 47822, graad3: 24144, graad4: 130, unk: 14493 },
  { year: 2016, graad1: 95961, graad2: 47289, graad3: 20398, graad4: 88, unk: 14667 },
  { year: 2017, graad1: 93435, graad2: 44796, graad3: 16662, graad4: 88, unk: 13718 },
  { year: 2018, graad1: 101797, graad2: 51960, graad3: 20101, graad4: 154, unk: 14339 },
  { year: 2019, graad1: 102282, graad2: 54693, graad3: 26388, graad4: 126, unk: 15389 },
  { year: 2020, graad1: 89716, graad2: 47882, graad3: 20613, graad4: 106, unk: 13546 },
  { year: 2021, graad1: 94970, graad2: 46665, graad3: 22562, graad4: 109, unk: 14517 },
  { year: 2022, graad1: 92018, graad2: 30032, graad3: 33323, graad4: 54, unk: 15317 },
  { year: 2023, graad1: 82695, graad2: 26220, graad3: 36080, graad4: 77, unk: 13795 },
];

// Niet‑snelheid zwaartegraad per maand (2023)
const NONSPEED_SEVERITY_MONTHLY_2023 = MONTHS_NL.map((m, i) => ({
  maand: m,
  graad1: [6515,7891,10100,7213,7209,7602,5313,5048,6938,6674,6214,5978][i],
  graad2: [2562,2560,3443,2349,2373,2146,1352,1346,1498,2221,2213,2157][i],
  graad3: [2611,2919,3494,2782,3502,3508,2463,2595,3700,3749,2627,2130][i],
  graad4: [1,5,1,2,13,7,7,2,14,12,5,8][i],
  unk: [1344,1371,1299,1086,1226,1289,1116,961,1045,1012,1022,1024][i],
}));

// Utils
const toPercent = (value: number, total: number) => total > 0 ? (100 * value) / total : 0;

// Thema -> kleur mapping
const themeColor = (theme: string, idx: number) => COLORS[idx % COLORS.length];

function useSelections() {
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>(["Snelheid", "Stilstaan en parkeren", "Verkeerslichten"]);
  const [metric, setMetric] = useState<"abs" | "pct">("abs");
  const [stacked, setStacked] = useState<boolean>(true);
  return { selectedThemes, setSelectedThemes, metric, setMetric, stacked, setStacked };
}

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-3">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);

const Controls: React.FC<{
  selectedThemes: Theme[];
  setSelectedThemes: (t: Theme[]) => void;
  metric: "abs" | "pct";
  setMetric: (m: "abs" | "pct") => void;
  stacked: boolean;
  setStacked: (b: boolean) => void;
}> = ({ selectedThemes, setSelectedThemes, metric, setMetric, stacked, setStacked }) => {
  const toggleTheme = (t: Theme) => {
    setSelectedThemes(
      selectedThemes.includes(t)
        ? selectedThemes.filter((x) => x !== t)
        : [...selectedThemes, t]
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 block">Thema's</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto pr-2">
              {THEMES.map((t, i) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selectedThemes.includes(t)} onCheckedChange={() => toggleTheme(t)} />
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor(t, i) }} />
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Metriek</Label>
            <div className="flex items-center gap-2">
              <Button variant={metric === "abs" ? "default" : "outline"} size="sm" onClick={() => setMetric("abs")}>
                <Hash className="w-4 h-4 mr-1" /> Absoluut
              </Button>
              <Button variant={metric === "pct" ? "default" : "outline"} size="sm" onClick={() => setMetric("pct")}>
                <Percent className="w-4 h-4 mr-1" /> % aandeel
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Weergave</Label>
            <div className="flex items-center gap-2">
              <Button variant={stacked ? "default" : "outline"} size="sm" onClick={() => setStacked(true)}>Stacked</Button>
              <Button variant={!stacked ? "default" : "outline"} size="sm" onClick={() => setStacked(false)}>Overlay</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// CSV export helper
function exportCSV(filename: string, rows: object[]) {
  const headers = Array.from(rows.reduce<Set<string>>((acc, r) => { Object.keys(r).forEach(k => acc.add(k)); return acc; }, new Set())).join(",");
  const body = rows.map(r => {
    return (headers.split(",").map(h => (r as any)[h] ?? "")).join(",");
  }).join("\n");
  const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Tooltip formatter voor %
function valueFormatter(value: any, name: any, props: any) {
  return [value, name];
}

// Kerncomponent
export default function AntwerpTrafficInfractionsDashboard() {
  const { selectedThemes, setSelectedThemes, metric, setMetric, stacked, setStacked } = useSelections();

  // Jaartrend dataset (2015–2023) — voor geselecteerde thema's
  const yearlySeries = useMemo(() => {
    return YEARLY_TOTALS.map((row) => {
      const total = row.Totaal ?? THEMES.reduce((sum, t) => sum + (row[t] ?? 0), 0);
      const base: any = { year: row.year };
      selectedThemes.forEach((t) => {
        const raw = row[t] ?? 0;
        base[t] = metric === "pct" ? toPercent(raw, total) : raw;
      });
      base.Totaal = metric === "pct" ? 100 : total;
      return base;
    });
  }, [selectedThemes, metric]);

  // 2023 per maand — voor geselecteerde thema's
  const monthlySeries = useMemo(() => {
    return MONTHLY_2023.map((row) => {
      const total = row.Totaal ?? THEMES.reduce((sum, t) => sum + (row[t] ?? 0), 0);
      const base: any = { maand: row.maand };
      selectedThemes.forEach((t) => {
        const raw = row[t] ?? 0;
        base[t] = metric === "pct" ? toPercent(raw, total) : raw;
      });
      base.Totaal = metric === "pct" ? 100 : total;
      return base;
    });
  }, [selectedThemes, metric]);

  // Inzichten 2023
  const insights2023 = useMemo(() => {
    const last = YEARLY_TOTALS.find((r) => r.year === 2023)!;
    const prev = YEARLY_TOTALS.find((r) => r.year === 2022)!;
    const totalChange = last.Totaal! - prev.Totaal!;
    // grootste stijger/daler per thema
    let best: { theme: Theme; diff: number } | null = null;
    let worst: { theme: Theme; diff: number } | null = null;
    THEMES.forEach((t) => {
      const diff = (last[t] ?? 0) - (prev[t] ?? 0);
      if (!best || diff > best.diff) best = { theme: t, diff } as any;
      if (!worst || diff < worst.diff) worst = { theme: t, diff } as any;
    });
    // drukste maand voor Snelheid
    const speedMonths = MONTHLY_2023.map((r) => ({ maand: r.maand, val: r["Snelheid"] ?? 0 }));
    const peak = speedMonths.reduce((acc, cur) => cur.val > acc.val ? cur : acc, speedMonths[0]);
    return { totalChange, best, worst, peak };
  }, []);

  // Tabeldata (vlak) — 2023 per maand voor alle thema's
  const tableRows = useMemo(() => MONTHLY_2023.map(r => ({ ...r })), []);

  return (
    <div className="p-4 md:p-6 max-w-[1300px] mx-auto font-sans">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verkeersinbreuken — PZ Antwerpen</h1>
        <p className="text-sm text-muted-foreground">2015–2023 (jaarlijks) en 2023 (maandelijks). Autosnelwegen inbegrepen. Bron: Federale Politie / BIPOL.</p>
      </header>

      <Controls
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        metric={metric}
        setMetric={setMetric}
        stacked={stacked}
        setStacked={setStacked}
      />

      <Tabs defaultValue="jaartrend" className="w-full">
        <TabsList>
          <TabsTrigger value="jaartrend">Jaartrend</TabsTrigger>
          <TabsTrigger value="maand2023">2023 per maand</TabsTrigger>
          <TabsTrigger value="snelheidsbanden">Snelheidsbanden</TabsTrigger>
          <TabsTrigger value="nietsnelheid">Niet‑snelheid: zwaartegraad</TabsTrigger>
          <TabsTrigger value="tabel">Tabel & Export</TabsTrigger>
        </TabsList>

        {/* Jaartrend 2015–2023 */}
        <TabsContent value="jaartrend">
          <SectionTitle title="Jaartrend (2015–2023)" subtitle={metric === "pct" ? "% aandeel van geselecteerde thema's per jaar" : "Absolute aantallen per jaar"} />
          <Card className="mb-6">
            <CardContent className="p-4 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                {stacked ? (
                  <BarChart data={yearlySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={valueFormatter} />
                    <Legend />
                    {selectedThemes.map((t, i) => (
                      <Bar key={t} dataKey={t} stackId="a" fill={themeColor(t, i)} />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={yearlySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={valueFormatter} />
                    <Legend />
                    {selectedThemes.map((t, i) => (
                      <Line key={t} type="monotone" dataKey={t} stroke={themeColor(t, i)} dot={false} />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Totaal 2023</div>
                <div className="text-2xl font-semibold">{(YEARLY_TOTALS.find(r=>r.year===2023)?.Totaal ?? 0).toLocaleString("nl-BE")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Δ t.o.v. 2022 (totaal)</div>
                <div className={`text-2xl font-semibold ${insights2023.totalChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>{insights2023.totalChange >= 0 ? "+" : ""}{insights2023.totalChange.toLocaleString("nl-BE")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Drukste maand voor snelheid (2023)</div>
                <div className="text-2xl font-semibold">{insights2023.peak.maand} — {insights2023.peak.val.toLocaleString("nl-BE")} meldingen</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2023 per maand */}
        <TabsContent value="maand2023">
          <SectionTitle title="2023 per maand" subtitle={metric === "pct" ? "% aandeel van geselecteerde thema's per maand" : "Absolute aantallen per maand"} />
          <Card className="mb-6">
            <CardContent className="p-4 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                {stacked ? (
                  <BarChart data={monthlySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="maand" />
                    <YAxis />
                    <Tooltip formatter={valueFormatter} />
                    <Legend />
                    {selectedThemes.map((t, i) => (
                      <Bar key={t} dataKey={t} stackId="a" fill={themeColor(t, i)} />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={monthlySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="maand" />
                    <YAxis />
                    <Tooltip formatter={valueFormatter} />
                    <Legend />
                    {selectedThemes.map((t, i) => (
                      <Line key={t} type="monotone" dataKey={t} stroke={themeColor(t, i)} dot={false} />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <SectionTitle title="Verdeling 2023 (alle thema's)" subtitle="% aandeel per thema over heel 2023" />
          <Card>
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {(() => {
                    const row = YEARLY_TOTALS.find(r => r.year === 2023)!;
                    const entries = THEMES.map((t, idx) => ({ name: t, value: row[t] ?? 0, color: themeColor(t, idx) }))
                      .filter(e => e.value > 0);
                    return (
                      <>
                        <Pie data={entries} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110}>
                          {entries.map((e, i) => <Cell key={e.name} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any, n: any) => [Number(v).toLocaleString("nl-BE"), n]} />
                        <Legend />
                      </>
                    );
                  })()}
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snelheidsbanden */}
        <TabsContent value="snelheidsbanden">
          <SectionTitle title="Snelheidsbanden — jaartrend (2015–2023)" subtitle="Aantal vaststellingen per snelheidsovertredingsband" />
          <Card className="mb-6">
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPEED_BANDS_YEARLY}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="_0_10" name="0–10 km/u" stroke="#2563eb" dot={false} />
                  <Line type="monotone" dataKey="_11_20" name="11–20 km/u" stroke="#16a34a" dot={false} />
                  <Line type="monotone" dataKey="_21_30" name="21–30 km/u" stroke="#dc2626" dot={false} />
                  <Line type="monotone" dataKey="_31_40" name="31–40 km/u" stroke="#7c3aed" dot={false} />
                  <Line type="monotone" dataKey="_gt40" name="> 40 km/u" stroke="#ea580c" dot={false} />
                  <Line type="monotone" dataKey="_unk" name="onbekend" stroke="#0891b2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <SectionTitle title="Snelheidsbanden — 2023 per maand" />
          <Card>
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPEED_BANDS_MONTHLY_2023}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="maand" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="_0_10" name="0–10 km/u" stackId="a" fill="#2563eb" />
                  <Bar dataKey="_11_20" name="11–20 km/u" stackId="a" fill="#16a34a" />
                  <Bar dataKey="_21_30" name="21–30 km/u" stackId="a" fill="#dc2626" />
                  <Bar dataKey="_31_40" name="31–40 km/u" stackId="a" fill="#7c3aed" />
                  <Bar dataKey="_gt40" name="> 40 km/u" stackId="a" fill="#ea580c" />
                  <Bar dataKey="_unk" name="onbekend" stackId="a" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Niet‑snelheid: zwaartegraad */}
        <TabsContent value="nietsnelheid">
          <SectionTitle title="Niet‑snelheid — jaartrend (2015–2023)" subtitle="Zwaartegraad 1–4 en onbekend/n.v.t." />
          <Card className="mb-6">
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={NONSPEED_SEVERITY_YEARLY}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="graad1" name="1ste graad" stroke="#2563eb" dot={false} />
                  <Line type="monotone" dataKey="graad2" name="2de graad" stroke="#16a34a" dot={false} />
                  <Line type="monotone" dataKey="graad3" name="3de graad" stroke="#dc2626" dot={false} />
                  <Line type="monotone" dataKey="graad4" name="4de graad" stroke="#7c3aed" dot={false} />
                  <Line type="monotone" dataKey="unk" name="Onbekend/NVT" stroke="#0891b2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <SectionTitle title="Niet‑snelheid — 2023 per maand" />
          <Card>
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={NONSPEED_SEVERITY_MONTHLY_2023}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="maand" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="graad1" name="1ste graad" stackId="a" fill="#2563eb" />
                  <Bar dataKey="graad2" name="2de graad" stackId="a" fill="#16a34a" />
                  <Bar dataKey="graad3" name="3de graad" stackId="a" fill="#dc2626" />
                  <Bar dataKey="graad4" name="4de graad" stackId="a" fill="#7c3aed" />
                  <Bar dataKey="unk" name="Onbekend/NVT" stackId="a" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tabel & Export */}
        <TabsContent value="tabel">
          <SectionTitle title="Tabel — 2023 per maand per thema" />
          <div className="overflow-auto border rounded-xl">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 sticky left-0 bg-muted/50">Maand</th>
                  {THEMES.map((t) => (
                    <th key={t} className="text-right p-2 whitespace-nowrap">{t}</th>
                  ))}
                  <th className="text-right p-2">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.maand} className="border-t">
                    <td className="p-2 sticky left-0 bg-background font-medium">{r.maand}</td>
                    {THEMES.map((t) => (
                      <td key={t} className="p-2 text-right tabular-nums">{(r as any)[t]?.toLocaleString("nl-BE") ?? ""}</td>
                    ))}
                    <td className="p-2 text-right font-semibold">{(r.Totaal ?? 0).toLocaleString("nl-BE")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                {(() => {
                  const sums: any = { Maand: "Totaal" };
                  THEMES.forEach((t) => sums[t] = tableRows.reduce((s, r) => s + ((r as any)[t] ?? 0), 0));
                  sums.Totaal = tableRows.reduce((s, r) => s + (r.Totaal ?? 0), 0);
                  return (
                    <tr>
                      <td className="p-2 sticky left-0 bg-muted/50 font-semibold">Totaal</td>
                      {THEMES.map((t) => (
                        <td key={t} className="p-2 text-right font-semibold">{sums[t].toLocaleString("nl-BE")}</td>
                      ))}
                      <td className="p-2 text-right font-semibold">{sums.Totaal.toLocaleString("nl-BE")}</td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
          <div className="mt-3">
            <Button onClick={() => exportCSV("verkeersinbreuken_pz_antwerpen_2023.csv", tableRows)}>
              <Download className="w-4 h-4 mr-2" /> Exporteer CSV (2023 per maand)
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <footer className="mt-8 text-xs text-muted-foreground">
        Laatste update dataset: 30/04/2024 (sluitingsdatum bronrapport). — Dit dashboard bevat jaartotalen (2015–2023) en maandoverzicht (2023).
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

type PeriodType = "harian" | "mingguan" | "bulanan" | "tahunan" | "custom";

interface PeriodSelectorProps {
  onPeriodChange: (period: PeriodType, startDate?: string, endDate?: string) => void;
}

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const [period, setPeriod] = useState<PeriodType>("bulanan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    if (period === "custom" && (!startDate || !endDate)) {
      return;
    }
    onPeriodChange(period, startDate, endDate);
    setOpen(false);
  };

  const handlePeriodChange = (value: PeriodType) => {
    setPeriod(value);
    if (value !== "custom") {
      onPeriodChange(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Pilih Periode: {period.charAt(0).toUpperCase() + period.slice(1)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Periode</Label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="mingguan">Mingguan</SelectItem>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleApply} className="w-full">
                Terapkan
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

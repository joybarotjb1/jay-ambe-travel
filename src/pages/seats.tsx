import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { Bed, Armchair, ChevronLeft, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBookedSeats } from "@/lib/data";

interface SearchInfo {
  from: string;
  to: string;
  date: string;
  type: string;
  fare: number;
  dep: string;
  arr: string;
}

function readQuery(): SearchInfo {
  const p = new URLSearchParams(window.location.search);
  return {
    from: p.get("from") || "",
    to: p.get("to") || "",
    date: p.get("date") || "",
    type: p.get("type") || "AC Sleeper",
    fare: parseInt(p.get("fare") || "1000", 10),
    dep: p.get("dep") || "",
    arr: p.get("arr") || "",
  };
}

function buildSeatLayout(busType: string) {
  const isSleeper = busType.toLowerCase().includes("sleeper");
  if (isSleeper) {
    const rows = 10;
    const lower: string[] = [];
    const upper: string[] = [];
    for (let r = 1; r <= rows; r++) {
      for (const pos of ["A", "B", "C"]) {
        lower.push(`L${r}${pos}`);
        upper.push(`U${r}${pos}`);
      }
    }
    return { isSleeper: true, lower, upper, totalSeats: rows * 6 };
  }
  const rows = 10;
  const seats: string[] = [];
  for (let r = 1; r <= rows; r++) {
    for (const pos of ["A", "B", "C", "D"]) {
      seats.push(`${r}${pos}`);
    }
  }
  return { isSleeper: false, seats, totalSeats: rows * 4 };
}

export default function Seats() {
  const params = useParams<{ busId: string }>();
  const [, setLocation] = useLocation();
  const info = useMemo(() => readQuery(), []);
  const layout = useMemo(() => buildSeatLayout(info.type), [info.type]);
  const bookedSet = useMemo(() => {
    const totalSeats = layout.totalSeats;
    const bookedRaw = getBookedSeats(params.busId, totalSeats);
    return new Set(bookedRaw);
  }, [params.busId, layout.totalSeats]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [params.busId]);

  const toggle = (seat: string) => {
    if (bookedSet.has(seat)) return;
    const next = new Set(selected);
    if (next.has(seat)) next.delete(seat);
    else next.add(seat);
    setSelected(next);
  };

  const baseFare = info.fare * selected.size;
  const gst = Math.round(baseFare * 0.05);
  const total = baseFare + gst;

  const continueToPassenger = () => {
    if (selected.size === 0) return;
    const seatsParam = Array.from(selected).join(",");
    const qs = new URLSearchParams({
      from: info.from,
      to: info.to,
      date: info.date,
      type: info.type,
      fare: String(info.fare),
      dep: info.dep,
      arr: info.arr,
      seats: seatsParam,
      base: String(baseFare),
      gst: String(gst),
      total: String(total),
    });
    setLocation(`/passenger/${params.busId}?${qs.toString()}`);
  };

  const renderSeat = (seat: string) => {
    const isBooked = bookedSet.has(seat);
    const isSelected = selected.has(seat);
    const isSleeper = layout.isSleeper;
    return (
      <button
        key={seat}
        type="button"
        onClick={() => toggle(seat)}
        disabled={isBooked}
        data-testid={`seat-${seat}`}
        className={`
          relative flex items-center justify-center transition-all
          ${isSleeper ? "w-16 h-10 rounded-md" : "w-12 h-12 rounded-md"}
          ${isBooked ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60" : ""}
          ${isSelected ? "bg-secondary text-secondary-foreground border-2 border-secondary scale-105 shadow-md" : ""}
          ${!isBooked && !isSelected ? "bg-background border-2 border-border hover:border-secondary hover:bg-secondary/10" : ""}
          text-xs font-medium
        `}
      >
        {isSleeper ? <Bed className="h-4 w-4" /> : <Armchair className="h-4 w-4" />}
        <span className="absolute -bottom-4 text-[10px] text-muted-foreground font-normal">
          {seat}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-primary text-primary-foreground py-5">
        <div className="container mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="text-lg font-semibold">
                {info.from} → {info.to}
              </div>
              <div className="text-sm opacity-80">
                {info.type} • {info.dep} → {info.arr} • {new Date(info.date).toDateString()}
              </div>
            </div>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">Choose your seats</Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
        <Card className="p-6 lg:p-10 overflow-x-auto">
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-border bg-background" /> Available
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-secondary bg-secondary" /> Selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted" /> Booked
            </div>
          </div>

          {layout.isSleeper ? (
            <div className="space-y-10 min-w-[420px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Lower Deck
                  </div>
                  <div className="text-xs text-muted-foreground">Driver →</div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-10 gap-2 gap-y-7"
                >
                  {layout.lower!.map(renderSeat)}
                </motion.div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Upper Deck
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-10 gap-2 gap-y-7"
                >
                  {layout.upper!.map(renderSeat)}
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="min-w-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Seater Layout
                </div>
                <div className="text-xs text-muted-foreground">Driver →</div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-10 gap-2 gap-y-7"
              >
                {layout.seats!.map(renderSeat)}
              </motion.div>
            </div>
          )}
        </Card>

        <Card className="p-6 h-fit lg:sticky lg:top-20">
          <h3 className="font-semibold text-lg mb-1">Booking Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selected.size === 0
              ? "Select at least one seat to continue."
              : `${selected.size} seat${selected.size > 1 ? "s" : ""} selected`}
          </p>

          {selected.size > 0 && (
            <>
              <div className="space-y-2 mb-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Seats</div>
                <div className="flex flex-wrap gap-2" data-testid="container-selected-seats">
                  {Array.from(selected).map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="border-secondary text-secondary"
                      data-testid={`badge-selected-${s}`}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base fare ({selected.size} × ₹{info.fare})
                  </span>
                  <span data-testid="text-base-fare">₹{baseFare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span data-testid="text-gst">₹{gst}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="flex items-center text-primary" data-testid="text-total">
                    <IndianRupee className="h-4 w-4" />
                    {total}
                  </span>
                </div>
              </div>
            </>
          )}

          <Button
            className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={selected.size === 0}
            onClick={continueToPassenger}
            data-testid="button-continue-passenger"
          >
            Continue to Passenger Details
          </Button>
        </Card>
      </div>
    </div>
  );
}

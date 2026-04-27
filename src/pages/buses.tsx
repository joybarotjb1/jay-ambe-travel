import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, Wifi, BatteryCharging, Bed, Snowflake, Filter, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { generateBuses, Bus } from "@/lib/data";

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    return new URLSearchParams(search);
  }, [location]);
}

const TIME_WINDOWS = [
  { id: "morning", label: "Morning (06-12)", start: 6, end: 12 },
  { id: "afternoon", label: "Afternoon (12-18)", start: 12, end: 18 },
  { id: "evening", label: "Evening (18-24)", start: 18, end: 24 },
  { id: "night", label: "Night (00-06)", start: 0, end: 6 },
];

export default function Buses() {
  const params = useQueryParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const date = params.get("date") || new Date().toISOString().slice(0, 10);

  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [timeFilters, setTimeFilters] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);

  useEffect(() => {
    if (!from || !to) {
      setLocation("/");
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      const list = generateBuses(from, to, date);
      setBuses(list);
      const max = Math.max(...list.map((b) => b.fare), 5000);
      setPriceRange([0, max]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [from, to, date, setLocation]);

  const filtered = useMemo(() => {
    return buses.filter((b) => {
      if (typeFilters.size > 0 && !typeFilters.has(b.type)) return false;
      if (timeFilters.size > 0) {
        const hour = parseInt(b.depTime.split(":")[0], 10);
        const matches = Array.from(timeFilters).some((id) => {
          const w = TIME_WINDOWS.find((x) => x.id === id);
          if (!w) return false;
          return hour >= w.start && hour < w.end;
        });
        if (!matches) return false;
      }
      if (b.fare < priceRange[0] || b.fare > priceRange[1]) return false;
      return true;
    });
  }, [buses, typeFilters, timeFilters, priceRange]);

  const allTypes = useMemo(() => Array.from(new Set(buses.map((b) => b.type))), [buses]);
  const maxPrice = useMemo(() => Math.max(...buses.map((b) => b.fare), 5000), [buses]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Modify search
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <span data-testid="text-from">{from}</span>
              <ArrowRight className="h-5 w-5 text-secondary" />
              <span data-testid="text-to">{to}</span>
            </div>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground" data-testid="text-date">
              {new Date(date).toDateString()}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-primary-foreground" data-testid="text-bus-count">
              {loading ? "Searching..." : `${filtered.length} buses available`}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-secondary" />
              <h3 className="font-semibold">Filters</h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Bus Type</Label>
              {allTypes.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${t}`}
                    checked={typeFilters.has(t)}
                    onCheckedChange={() => toggle(typeFilters, setTypeFilters, t)}
                    data-testid={`checkbox-type-${t.replace(/\s+/g, "-")}`}
                  />
                  <Label htmlFor={`type-${t}`} className="text-sm font-normal cursor-pointer">
                    {t}
                  </Label>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Departure Time</Label>
              {TIME_WINDOWS.map((w) => (
                <div key={w.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`time-${w.id}`}
                    checked={timeFilters.has(w.id)}
                    onCheckedChange={() => toggle(timeFilters, setTimeFilters, w.id)}
                    data-testid={`checkbox-time-${w.id}`}
                  />
                  <Label htmlFor={`time-${w.id}`} className="text-sm font-normal cursor-pointer">
                    {w.label}
                  </Label>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="text-sm text-muted-foreground">
                ₹{priceRange[0]} – ₹{priceRange[1]}
              </div>
              <Slider
                min={0}
                max={maxPrice}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                data-testid="slider-price"
              />
            </div>
          </Card>
        </aside>

        <main className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-1/3 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <div className="flex justify-between">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                </Card>
              ))}
            </>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg font-medium mb-2">No buses match your filters</p>
              <p className="text-muted-foreground mb-4">Try clearing some filters to see more options.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilters(new Set());
                  setTimeFilters(new Set());
                  setPriceRange([0, maxPrice]);
                }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            </Card>
          ) : (
            filtered.map((bus, idx) => (
              <motion.div
                key={bus.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow" data-testid={`card-bus-${bus.id}`}>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1 min-w-[260px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{bus.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {bus.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-secondary mb-3">
                        <Star className="h-4 w-4 fill-secondary" />
                        <span className="font-medium" data-testid={`text-rating-${bus.id}`}>
                          {bus.rating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">/ 5</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bus.amenities.includes("WiFi") && (
                          <Badge variant="secondary" className="text-xs"><Wifi className="h-3 w-3 mr-1" /> WiFi</Badge>
                        )}
                        {bus.amenities.includes("Charging Point") && (
                          <Badge variant="secondary" className="text-xs"><BatteryCharging className="h-3 w-3 mr-1" /> Charging</Badge>
                        )}
                        {bus.type.includes("Sleeper") && (
                          <Badge variant="secondary" className="text-xs"><Bed className="h-3 w-3 mr-1" /> Sleeper</Badge>
                        )}
                        {bus.type.includes("AC") && (
                          <Badge variant="secondary" className="text-xs"><Snowflake className="h-3 w-3 mr-1" /> AC</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold tracking-tight" data-testid={`text-deptime-${bus.id}`}>
                          {bus.depTime}
                        </div>
                        <div className="text-xs text-muted-foreground">{from}</div>
                      </div>
                      <div className="flex flex-col items-center text-muted-foreground min-w-[80px]">
                        <Clock className="h-4 w-4 mb-1" />
                        <span className="text-xs">{bus.duration}</span>
                        <div className="h-px w-full bg-border my-1" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold tracking-tight" data-testid={`text-arrtime-${bus.id}`}>
                          {bus.arrTime}
                        </div>
                        <div className="text-xs text-muted-foreground">{to}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-3 min-w-[140px]">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary" data-testid={`text-fare-${bus.id}`}>
                          ₹{bus.fare}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bus.availableSeats} seats left
                        </div>
                      </div>
                      <Link
                        href={`/seats/${bus.id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&type=${encodeURIComponent(bus.type)}&fare=${bus.fare}&dep=${bus.depTime}&arr=${encodeURIComponent(bus.arrTime)}`}
                      >
                        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid={`button-select-${bus.id}`}>
                          View Seats
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

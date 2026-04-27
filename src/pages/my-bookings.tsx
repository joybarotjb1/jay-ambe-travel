import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Download, Eye, MapPin, Calendar, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Booking, getUserBookings } from "@/lib/storage";
import { downloadTicketHTML } from "@/lib/ticket";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const list = await getUserBookings(user.email);
      if (cancelled) return;
      setBookings(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="h-7 w-7 text-secondary" />
            <h1 className="text-3xl font-bold">My Bookings</h1>
          </div>
          <p className="opacity-80 text-sm">
            All your past and upcoming Jay Ambe Travels reservations.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">
              Book your first journey and it'll show up here.
            </p>
            <Link href="/">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-search-buses">
                Search Buses
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, idx) => (
              <motion.div
                key={b.pnr}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6" data-testid={`card-booking-${b.pnr}`}>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1 min-w-[260px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-500 text-white border-0">{b.status}</Badge>
                        <span className="text-xs font-mono text-muted-foreground" data-testid={`text-pnr-${b.pnr}`}>
                          {b.pnr}
                        </span>
                      </div>
                      <div className="text-lg font-semibold flex items-center gap-2 flex-wrap">
                        <span>{b.from}</span>
                        <span className="text-secondary">→</span>
                        <span>{b.to}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(b.date).toDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.boardingPoint}
                        </span>
                        <span>
                          {b.seats.length} seat{b.seats.length > 1 ? "s" : ""} • {b.busType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end">
                      <Link href={`/confirmation/${b.pnr}`}>
                        <Button size="sm" variant="outline" data-testid={`button-view-${b.pnr}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          downloadTicketHTML(b);
                          toast.success("Ticket downloaded.");
                        }}
                        data-testid={`button-download-${b.pnr}`}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

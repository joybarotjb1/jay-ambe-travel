import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Download, Mail, Plus, IndianRupee, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking, getBookingByPnr } from "@/lib/storage";
import { downloadTicketHTML } from "@/lib/ticket";

function fireFireworks() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.4 + 0.2 },
      colors: ["#f59e0b", "#0F172A", "#10b981", "#ffffff"],
    });
  }, 250);
}

export default function Confirmation() {
  const params = useParams<{ pnr: string }>();
  const [, setLocation] = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await getBookingByPnr(params.pnr);
      if (cancelled) return;
      setBooking(b);
      setLoading(false);
      if (b) {
        setTimeout(fireFireworks, 200);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.pnr]);

  const onDownload = () => {
    if (!booking) return;
    downloadTicketHTML(booking);
    toast.success("Ticket downloaded. Open it and use Print to save as PDF.");
  };

  const onEmail = async () => {
    if (!booking) return;
    setEmailing(true);
    await new Promise((r) => setTimeout(r, 900));
    setEmailing(false);
    toast.success(`Ticket sent to ${booking.contactEmail}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium mb-4">We couldn't find this booking.</p>
        <Button onClick={() => setLocation("/")} data-testid="button-back-home">
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-full font-semibold mb-4">
            <CheckCircle2 className="h-5 w-5" />
            <span data-testid="text-status">CONFIRMED</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Your trip is booked.
          </h1>
          <p className="text-muted-foreground mt-2">
            We've reserved your seat{booking.seats.length > 1 ? "s" : ""} on Jay Ambe Travels.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground p-6 flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-widest opacity-80">E-Ticket / Boarding Pass</div>
                <h2 className="text-2xl font-bold mt-1">Jay Ambe Travels</h2>
              </div>
              <Badge className="bg-green-500 hover:bg-green-500 text-white border-0">CONFIRMED</Badge>
            </div>

            <div className="p-6 grid md:grid-cols-[1fr_auto] gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">PNR</div>
                    <div className="font-mono font-bold text-lg text-primary" data-testid="text-pnr">
                      {booking.pnr}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Date</div>
                    <div className="font-semibold">{new Date(booking.date).toDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Bus Type</div>
                    <div className="font-semibold">{booking.busType}</div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">From</div>
                      <div className="font-bold text-lg">{booking.from}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {booking.departureTime}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {booking.boardingPoint}
                      </div>
                    </div>
                    <div className="text-secondary text-xl">→</div>
                    <div className="flex-1 text-right">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">To</div>
                      <div className="font-bold text-lg">{booking.to}</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {booking.arrivalTime}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Passengers</div>
                  <div className="space-y-2" data-testid="container-passengers">
                    {booking.passengers.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-background border rounded-md px-3 py-2 text-sm"
                      >
                        <div>
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-muted-foreground ml-2">
                            • {p.age} • {p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}
                          </span>
                        </div>
                        <Badge variant="outline" className="border-secondary text-secondary font-mono">
                          {booking.seats[i]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Contact: {booking.contactEmail} • {booking.contactPhone}
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</div>
                    <div className="font-bold text-2xl text-primary flex items-center justify-end">
                      <IndianRupee className="h-5 w-5" />
                      {booking.totalFare}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-dashed border-border pt-6 md:pt-0 md:pl-8 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-3 rounded-md border">
                  <QRCodeSVG value={booking.pnr} size={140} />
                </div>
                <div className="text-xs text-muted-foreground mt-3 max-w-[160px]">
                  Show this code at the boarding point for quick check-in.
                </div>
                <div className="mt-4 h-8 w-full" style={{
                  background: "repeating-linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)) 2px, transparent 2px, transparent 5px)",
                  opacity: 0.4,
                }} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center mt-6"
        >
          <Button
            size="lg"
            onClick={onDownload}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-download-ticket"
          >
            <Download className="h-4 w-4 mr-2" /> Download Ticket
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onEmail}
            disabled={emailing}
            data-testid="button-email-ticket"
          >
            <Mail className="h-4 w-4 mr-2" />
            {emailing ? "Sending..." : "Email Ticket"}
          </Button>
          <Link href="/">
            <Button size="lg" variant="ghost" data-testid="button-book-another">
              <Plus className="h-4 w-4 mr-2" /> Book Another
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

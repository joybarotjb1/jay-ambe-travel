import { useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ChevronLeft, IndianRupee, ShieldCheck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { createBooking } from "@/lib/storage";

const passengerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? parseInt(v, 10) : v))
    .refine((v) => !isNaN(v) && v >= 1 && v <= 120, { message: "Age must be 1–120" }),
  gender: z.enum(["male", "female", "other"], { message: "Select a gender" }),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  contactEmail: z.string().email("Enter a valid email"),
  contactPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
});

type FormValues = z.infer<typeof formSchema>;

function readQuery() {
  const p = new URLSearchParams(window.location.search);
  return {
    from: p.get("from") || "",
    to: p.get("to") || "",
    date: p.get("date") || "",
    type: p.get("type") || "",
    fare: parseInt(p.get("fare") || "0", 10),
    dep: p.get("dep") || "",
    arr: p.get("arr") || "",
    seats: (p.get("seats") || "").split(",").filter(Boolean),
    base: parseInt(p.get("base") || "0", 10),
    gst: parseInt(p.get("gst") || "0", 10),
    total: parseInt(p.get("total") || "0", 10),
  };
}

export default function PassengerPage() {
  const params = useParams<{ busId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const info = useMemo(() => readQuery(), []);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: info.seats.map(() => ({ name: "", age: 25, gender: "male" as const })),
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "passengers" });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("Please log in to continue.");
      setLocation("/login");
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({
        userEmail: user.email,
        busId: params.busId,
        busName: "Jay Ambe Travels",
        busType: info.type,
        from: info.from,
        to: info.to,
        date: info.date,
        departureTime: info.dep,
        arrivalTime: info.arr,
        boardingPoint: `${info.from} Central Bus Stand`,
        seats: info.seats,
        passengers: values.passengers,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        baseFare: info.base,
        gst: info.gst,
        totalFare: info.total,
      });
      toast.success("Booking confirmed!");
      setLocation(`/confirmation/${booking.pnr}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
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
              <ChevronLeft className="h-4 w-4 mr-1" /> Change seats
            </Button>
            <div>
              <div className="text-lg font-semibold">Passenger Details</div>
              <div className="text-sm opacity-80">
                {info.from} → {info.to} • {new Date(info.date).toDateString()}
              </div>
            </div>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">
            {info.seats.length} seat{info.seats.length > 1 ? "s" : ""} • ₹{info.total}
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Passenger {idx + 1}</h3>
                    <Badge variant="outline" className="border-secondary text-secondary">
                      Seat {info.seats[idx]}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`passengers.${idx}.name`}
                      render={({ field: f }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="As per government ID"
                              {...f}
                              data-testid={`input-passenger-name-${idx}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`passengers.${idx}.age`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={120}
                              {...f}
                              data-testid={`input-passenger-age-${idx}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`passengers.${idx}.gender`}
                    render={({ field: f }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={f.value}
                            onValueChange={f.onChange}
                            className="flex gap-4"
                          >
                            {(["male", "female", "other"] as const).map((g) => (
                              <div key={g} className="flex items-center gap-2">
                                <RadioGroupItem value={g} id={`gender-${idx}-${g}`} data-testid={`radio-gender-${idx}-${g}`} />
                                <Label htmlFor={`gender-${idx}-${g}`} className="capitalize cursor-pointer">
                                  {g}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </motion.div>
            ))}

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...f} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" maxLength={10} {...f} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Ticket and updates will be sent to this email.
              </p>
            </Card>
          </div>

          <Card className="p-6 h-fit lg:sticky lg:top-20">
            <h3 className="font-semibold text-lg mb-4">Fare Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare ({info.seats.length} seats)</span>
                <span>₹{info.base}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (5%)</span>
                <span>₹{info.gst}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span>Total Payable</span>
                <span className="flex items-center text-primary">
                  <IndianRupee className="h-4 w-4" />
                  {info.total}
                </span>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>100% safe and secure simulated payment.</span>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <span>This is a demo — no real payment is processed.</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={submitting}
              data-testid="button-confirm-pay"
            >
              {submitting ? "Confirming..." : `Confirm & Pay ₹${info.total}`}
            </Button>
          </Card>
        </form>
      </Form>
    </div>
  );
}

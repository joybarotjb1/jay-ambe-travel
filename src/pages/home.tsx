import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CITIES } from "@/lib/data";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  from: z.string().min(1, "Origin is required"),
  to: z.string().min(1, "Destination is required"),
  date: z.date({
    required_error: "Date is required",
  }),
}).refine((data) => data.from !== data.to, {
  message: "Origin and destination cannot be the same",
  path: ["to"],
});

export default function Home() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: "",
      to: "",
    },
  });

  function onSubmit(values: z.infer<typeof searchSchema>) {
    const searchParams = new URLSearchParams({
      from: values.from,
      to: values.to,
      date: format(values.date, "yyyy-MM-dd"),
    });
    setLocation(`/buses?${searchParams.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary pt-20 pb-32 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary"></div>
          
          <div className="container relative z-10 px-4 mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              Smart Bus Reservation System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12"
            >
              Premium intercity travel across India. Book your next journey with Jay Ambe Travels.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-4xl mx-auto bg-card rounded-2xl p-4 md:p-6 shadow-2xl"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
                  
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full text-left">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full h-14 justify-start text-left font-normal border-card-border bg-background text-foreground", !field.value && "text-muted-foreground")}
                              >
                                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                                {field.value ? field.value : "Leaving from"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search city..." />
                              <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                  {CITIES.map((city) => (
                                    <CommandItem
                                      value={city}
                                      key={city}
                                      onSelect={() => {
                                        form.setValue("from", city);
                                      }}
                                    >
                                      {city}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full text-left">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full h-14 justify-start text-left font-normal border-card-border bg-background text-foreground", !field.value && "text-muted-foreground")}
                              >
                                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                                {field.value ? field.value : "Going to"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search city..." />
                              <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                  {CITIES.map((city) => (
                                    <CommandItem
                                      value={city}
                                      key={city}
                                      onSelect={() => {
                                        form.setValue("to", city);
                                      }}
                                    >
                                      {city}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full text-left">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("w-full h-14 justify-start text-left font-normal border-card-border bg-background text-foreground", !field.value && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                {field.value ? format(field.value, "PPP") : <span>Date of journey</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto h-14 px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg" data-testid="button-search">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </form>
              </Form>
            </motion.div>
          </div>
        </section>

        {/* Features/Trust Strip */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">50+ Cities Connected</h3>
                <p className="text-muted-foreground">Extensive network covering major destinations across India.</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Best Price Guarantee</h3>
                <p className="text-muted-foreground">Transparent pricing with no hidden charges or extra fees.</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
                <p className="text-muted-foreground">Verified operators, GPS tracking, and 24/7 customer support.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-80">© {new Date().getFullYear()} Jay Ambe Travels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

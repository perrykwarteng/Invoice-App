import { motion } from "framer-motion";
import Button from "./ui/btn";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const route = useRouter();

  const DashboardImg =
    "https://res.cloudinary.com/dipfghq3k/image/upload/v1783533589/InvoiceDash_zfgyck.png";

  return (
    <section className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-4 pt-28 pb-20 bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-primary rounded-full blur-3xl -right-20 top-20 opacity-15" />
        <div className="absolute w-72 h-72 bg-dark rounded-full blur-3xl -left-20 top-32 opacity-15" />
        <div className="absolute w-96 h-96 bg-secondary rounded-full blur-3xl left-1/3 top-40 opacity-15" />
        <div className="absolute w-96 h-96 bg-accent rounded-full blur-3xl right-1/4 top-80 opacity-15" />
      </div>

      <div className="absolute inset-0 bg-white/30 backdrop-blur-2xl" />
      <div
        className="
          absolute top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2
          w-150 h-100 
          md:w-250 md:h-175
          opacity-[0.05] md:opacity-[0.1]
          overflow-hidden
        "
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            lg:text-6xl
            font-medium
            leading-tight
            text-gray-900
            font-Unbounded
            w-full
            px-5
            md:px-0
          "
        >
          Create Professional Invoices In{" "}
          <span className="text-secondary">Under 3 Minutes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="
            mt-6
            text-sm
            sm:text-base
            md:text-lg
            text-primary/80
            max-w-2xl
            px-7
            md:px-0
            leading-relaxed
          "
        >
          Meet SwiftInvoice, the simple way to create and track invoices for
          your business. Manage clients, monitor drafts and overdues faster all
          from one clean dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          <div className="w-40">
            <Button variant="outline" onClick={() => route.push("/register")}>
              Get Started
            </Button>
          </div>

          <div className="w-45">
            <Button variant="primary">See How it Works</Button>
          </div>
        </motion.div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-center md:justify-start md:gap-x-6 text-accent font-medium">
          <p>REAL-TIME TAX CALCULATION</p>
          <p>LIVE INVOICE PREVIEW</p>
          <p>INSTANT EMAIL DELIVERY</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 mt-10 w-full max-w-6xl px-4"
      >
        <div className="relative rounded-2xl border-4 border-accent/30 bg-white/95 overflow-hidden">
          <div className="absolute -inset-x-10 -top-10 h-20 bg-secondary/30 blur-2xl" />

          <Image
            src={DashboardImg}
            alt="SwiftInvoice dashboard"
            width={1920}
            height={960}
            priority
            className="
              relative 
              w-full 
              h-auto 
              object-cover
            "
          />
        </div>
      </motion.div>
    </section>
  );
};

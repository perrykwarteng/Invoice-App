"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/btn";
import { X, Menu } from "lucide-react";

export const Navbar = () => {
  const route = useRouter();
  const [sticky, setSticky] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menuItems = ["About", "Product", "Solutions"];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${
        sticky
          ? "bg-white/50 backdrop-blur-md border-accent/20"
          : "bg-white border-accent/30"
      } border-b-2`}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-3">
        <div className="text-xl font-bold text-accent">SwiftInvoice</div>

        <div className="hidden md:block">
          <ul className="flex gap-8">
            {menuItems.map((item) => (
              <li
                key={item}
                className="cursor-pointer text-accent hover:text-accent transition duration-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="w-32">
            <Button variant="primary" onClick={() => route.push("/login")}>
              Login
            </Button>
          </div>

          <div className="w-32">
            <Button variant="outline" onClick={() => route.push("/register")}>
              Get Started
            </Button>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl text-accent"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-6 pb-5">
              <ul className="flex flex-col gap-4">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="cursor-pointer text-accent hover:text-accent"
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="flex flex-col gap-3 mt-5"
              >
                <Button variant="primary" onClick={() => route.push("/login")}>
                  Login
                </Button>

                <Button
                  variant="outline"
                  onClick={() => route.push("/register")}
                >
                  Get Started
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
